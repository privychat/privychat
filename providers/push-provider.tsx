"use client";
import React, {useEffect, useRef, useState, useCallback} from "react";
import {usePrivy} from "@privy-io/react-auth";
import {useWalletClient} from "wagmi";
import {CONSTANTS, Env, IUser, PushAPI} from "@pushprotocol/restapi";
import {AppContext} from "@/context/app-context";
import {CHAT_TYPE, DEFAULT_PFP, MESSAGE_TYPE, STREAM_SOURCE} from "@/constants";
import {getUserKeys, playNotification, saveUserKeys} from "@/lib/utils";
import {IFeeds, IMessage, IStreamMessage, IlastSeenInfo} from "@/types";
import {getAddress} from "viem";
import axios from "axios";

export default function AppProvider({children}: {children: React.ReactNode}) {
  // User account related state
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);

  // Chat related state
  const [feeds, setFeeds] = useState<IFeeds[] | null>(null);
  const [requests, setRequests] = useState<IFeeds[] | null>(null);
  const [fetchingChats, setFetchingChats] = useState({
    feeds: {allPagesFetched: false, fetching: false},
    requests: {allPagesFetched: false, fetching: false},
  });
  const [chatHistoryLoaders, setChatHistoryLoaders] = useState<
    Record<string, boolean>
  >({});
  const [historyFetchedChats, setHistoryFetchedChats] = useState<
    Record<string, boolean>
  >({});
  const [feedContent, setFeedContent] = useState<
    Record<string, IMessage[] | null>
  >({});
  const [requestsContent, setRequestsContent] = useState<
    Record<string, IMessage[] | null>
  >({});
  const [contactBook, setContactBook] = useState<Record<string, string>>({});
  const [pinnedChats, setPinnedChats] = useState<string[]>([]);
  const [lastSeenInfo, setLastSeenInfo] = useState<IlastSeenInfo[]>([]);
  // UI state
  const [activeChat, setActiveChat] = useState<IFeeds | null>(null);
  const [chatSearch, setChatSearch] = useState<string>("");
  const [activeChatTab, setActiveChatTab] = useState<CHAT_TYPE>(CHAT_TYPE.ALL);
  const [replyRef, setReplyRef] = useState<{
    cid: string;
    message: string;
    sender: string;
  } | null>(null);
  const [latestStreamMessage, setLatestStreamMessage] =
    useState<IStreamMessage | null>(null);
  // Refs
  const feedsRef = useRef(feeds);
  const feedContentRef = useRef(feedContent);
  const pushStreamRef = useRef<any | null>(null);

  // Hooks
  const {data: signer} = useWalletClient();
  const {user: privyUser, ready, authenticated} = usePrivy();

  const initializePushUser = useCallback(async () => {
    try {
      const {userAccount, userKey} = getUserKeys();

      if (!userAccount && !userKey && !signer) return;

      const user = await PushAPI.initialize(signer, {
        env: (process.env.NEXT_PUBLIC_PUSH_ENV! as Env) || CONSTANTS.ENV.PROD,
        decryptedPGPPrivateKey: userKey,
        account: userAccount,
      });

      if (!user.decryptedPgpPvtKey) return;

      saveUserKeys(user.decryptedPgpPvtKey, user.account);
      setPushUser(user);
      setAccount(user.account);

      const stream = await user.initStream([CONSTANTS.STREAM.CHAT]);
      setupStreamListeners(stream);

      await stream.connect();

      pushStreamRef.current = stream;
    } catch (error) {
      console.error("Failed to initialize Push user:", error);
    }
  }, [signer]);

  const setupStreamListeners = (stream: any) => {
    stream.on(CONSTANTS.STREAM.CONNECT, () => console.log("Stream Connected"));
    stream.on(CONSTANTS.STREAM.DISCONNECT, () =>
      console.log("Stream Disconnected")
    );
    stream.on(CONSTANTS.STREAM.CHAT, handleIncomingMessage);
    stream.on(CONSTANTS.STREAM.CHAT_OPS, (message: any) =>
      console.log("Chat Ops", message)
    );
  };

  const handleIncomingMessage = useCallback((stream: IStreamMessage) => {
    setLatestStreamMessage(stream);

    if (
      stream.origin === STREAM_SOURCE.SELF ||
      (stream.event !== "chat.request" && stream.event !== "chat.message")
    )
      return;

    const {chatId, from, message, timestamp, reference, meta} = stream;
    const isGroup = meta.group;

    let messageContent: string;
    let messageReference: string | undefined;

    if (typeof message.content === "string") {
      messageContent = message.content;
    } else {
      messageContent = message.content.messageObj.content;
    }
    messageReference = message.reference;

    const newMessage: IMessage = {
      cid: reference,
      from,
      to: chatId,
      timestamp: Number(timestamp),
      messageContent: {
        content: messageContent,
        reference: messageReference,
      },
      link: reference,
      type: message.type,
    };

    updateChatContent(chatId, newMessage);
    updateChatList(chatId, newMessage, isGroup);
    playNotification();
  }, []);

  const updateChatContent = useCallback(
    (chatId: string, newMessage: IMessage) => {
      const updateFunction = (
        prevContent: Record<string, IMessage[] | null>
      ) => ({
        ...prevContent,
        [chatId]: [...(prevContent[chatId] || []), newMessage],
      });

      if (feedContentRef.current.hasOwnProperty(chatId)) {
        setFeedContent(updateFunction);
      } else {
        setRequestsContent(updateFunction);
      }
    },
    []
  );

  const updateChatList = useCallback(
    (chatId: string, newMessage: IMessage, isGroup: boolean) => {
      const updateFunction = (prevChats: IFeeds[] | null) => {
        if (!prevChats) return null;
        const chatIndex = prevChats.findIndex((chat) => chat.chatId === chatId);
        if (chatIndex === -1) {
          return [
            ...prevChats,
            {
              chatId,
              did: newMessage.from,
              profilePicture: DEFAULT_PFP,
              lastMessage: newMessage.messageContent.content,
              lastMessageTimestamp: newMessage.timestamp,
              isGroup,
            },
          ];
        }
        const updatedChats = [...prevChats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: newMessage.messageContent.content,
          lastMessageTimestamp: newMessage.timestamp,
        };
        return updatedChats;
      };

      if (feedsRef.current?.find((feed) => feed.chatId === chatId)) {
        setFeeds(updateFunction);
      } else {
        setRequests(updateFunction);
      }
    },
    []
  );

  const getUserChats = useCallback(
    async (page: number = 1) => {
      if (!pushUser) return;
      setFetchingChats((prev) => ({
        ...prev,
        feeds: {...prev.feeds, fetching: true},
      }));

      try {
        const chats = await pushUser.chat.list("CHATS", {limit: 10, page});
        if (!chats) return;

        const formattedChats = chats
          .map((chat) => ({
            chatType: "CHATS",
            ...chat,
          }))
          .map(formatChat);
        if (page === 1) {
          setFeeds(formattedChats);
        } else
          setFeeds((prevChats) => [...(prevChats || []), ...formattedChats]);

        if (chats.length < 10) {
          setFetchingChats((prev) => ({
            ...prev,
            feeds: {fetching: false, allPagesFetched: true},
          }));
        } else {
          await getUserChats(page + 1);
        }
      } catch (error) {
        console.error("Failed to fetch user chats:", error);
        setFetchingChats((prev) => ({
          ...prev,
          feeds: {...prev.feeds, fetching: false},
        }));
      }
    },
    [pushUser]
  );

  const getUserRequests = useCallback(
    async (page: number = 1) => {
      if (!pushUser) return;
      setFetchingChats((prev) => ({
        ...prev,
        requests: {...prev.requests, fetching: true},
      }));

      try {
        const requests = await pushUser.chat.list("REQUESTS", {
          limit: 10,
          page,
        });
        if (!requests) return;

        const formattedRequests = requests
          .map((chat) => ({
            chatType: "REQUESTS",
            ...chat,
          }))
          .map(formatChat);
        if (page === 1) {
          setRequests(formattedRequests);
        } else
          setRequests((prevRequests) => [
            ...(prevRequests || []),
            ...formattedRequests,
          ]);

        if (requests.length < 10) {
          setFetchingChats((prev) => ({
            ...prev,
            requests: {fetching: false, allPagesFetched: true},
          }));
        } else {
          await getUserRequests(page + 1);
        }
      } catch (error) {
        console.error("Failed to fetch user requests:", error);
        setFetchingChats((prev) => ({
          ...prev,
          requests: {...prev.requests, fetching: false},
        }));
      }
    },
    [pushUser]
  );

  const formatChat = (chat: any): IFeeds => ({
    chatId: chat.chatId!,
    did: chat.did,
    lastMessage: chat.msg.messageContent,
    lastMessageTimestamp: Date.parse(chat.intentTimestamp.toString()),
    profilePicture:
      chat.profilePicture || chat.groupInformation?.groupImage || DEFAULT_PFP,
    isGroup: !!chat.groupInformation?.chatId,
    groupName: chat.groupInformation?.groupName,
    groupParticipants: chat.groupInformation?.members,
    chatType: chat.chatType,
  });

  const getUserDetails = useCallback(async () => {
    if (!pushUser) return;
    try {
      const user = await pushUser.info();
      if (user) setUserInfo(user);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  }, [pushUser]);

  const getMessagesForLatestChats = useCallback(
    async (chats: IFeeds[], tab: "CHATS" | "REQUESTS") => {
      if (!pushUser) return;

      const historyPromises = chats.map(async (chat) => {
        if (historyFetchedChats[chat.chatId!]) return;

        setHistoryFetchedChats((prev) => ({...prev, [chat.chatId!]: true}));
        setChatHistoryLoaders((prev) => ({...prev, [chat.chatId!]: true}));

        try {
          const history = await pushUser.chat.history(chat.chatId!, {
            limit: 15,
          });
          if (!history) return;

          const historyFormatted: IMessage[] = history
            .map((msg) => ({
              cid: msg.cid,
              to: msg.toDID,
              from: msg.fromDID,
              type: msg.messageType,
              messageContent: {
                content:
                  msg.messageType === MESSAGE_TYPE.REPLY
                    ? msg.messageObj.content.messageObj.content
                    : msg.messageObj?.content ?? msg.messageContent,
                ...(msg.messageObj?.reference && {
                  reference: msg.messageObj.reference,
                }),
              },
              timestamp: msg.timestamp,
              link: msg.link,
            }))
            .reverse();

          const setContentFunction =
            tab === "CHATS" ? setFeedContent : setRequestsContent;
          setContentFunction((prev) => ({
            ...prev,
            [chat.chatId!]: [
              ...(prev[chat.chatId!] || []),
              ...historyFormatted,
            ],
          }));
        } catch (error) {
          console.error(
            `Failed to fetch chat history for ${chat.chatId}:`,
            error
          );
        } finally {
          setChatHistoryLoaders((prev) => ({...prev, [chat.chatId!]: false}));
        }
      });

      await Promise.all(historyPromises);
    },
    [pushUser, historyFetchedChats]
  );

  const getUserContactBook = useCallback(async () => {
    if (!account) return;
    try {
      const contactsResponse = await fetch(
        `api/user?address=${getAddress(account)}`,
        {
          method: "PUT",
          body: JSON.stringify({}),
        }
      );
      if (!contactsResponse.ok) return;
      const {data} = await contactsResponse.json();
      if (!data) return;

      setContactBook(data.contacts);
    } catch (error) {
      console.error("Failed to fetch user contacts:", error);
    }
  }, [account]);
  const getUserPinnedChats = useCallback(async () => {
    if (!account) return;
    try {
      const {data} = await axios.get(
        `/api/pin-chat?address=${getAddress(account)}`
      );
      if (!data) return;

      setPinnedChats(data.pinnedChats);
    } catch (error) {
      console.error("Failed to fetch user pinned chats:", error);
    }
  }, [account]);
  const getUserLastSeenInfo = useCallback(async () => {
    if (!account) return;
    try {
      const {data} = await axios.get(
        `/api/lastseen?address=${getAddress(account)}`
      );

      if (!data) return;

      setLastSeenInfo(data.lastSeen);
    } catch (error) {
      console.error("Failed to fetch user lastseen:", error);
    }
  }, [account]);

  useEffect(() => {
    feedContentRef.current = feedContent;
  }, [feedContent]);

  useEffect(() => {
    feedsRef.current = feeds;
  }, [feeds]);

  useEffect(() => {
    if (feeds && feeds.length > 0) getMessagesForLatestChats(feeds, "CHATS");
  }, [feeds, getMessagesForLatestChats]);

  useEffect(() => {
    if (requests && requests.length > 0)
      getMessagesForLatestChats(requests, "REQUESTS");
  }, [requests, getMessagesForLatestChats]);

  useEffect(() => {
    if (pushUser) {
      Promise.all([
        getUserChats(),
        getUserRequests(),
        getUserDetails(),
        getUserContactBook(),
        getUserPinnedChats(),
        getUserLastSeenInfo(),
      ]);
    }
  }, [
    pushUser,
    getUserChats,
    getUserRequests,
    getUserDetails,
    getUserContactBook,
    getUserPinnedChats,
    getUserLastSeenInfo,
  ]);

  useEffect(() => {
    const localUser = getUserKeys();
    setIsUserAuthenticated(
      !!(
        (localUser && localUser.userAccount && localUser.userKey) ||
        (authenticated && signer)
      )
    );
  }, [signer, authenticated, ready, privyUser]);

  useEffect(() => {
    initializePushUser();
    return () => {
      if (pushStreamRef.current) pushStreamRef.current.disconnect();
    };
  }, []);

  const contextValue = {
    isUserAuthenticated,
    setIsUserAuthenticated,
    account,
    setAccount,
    pushUser,
    setPushUser,
    userInfo,
    setUserInfo,
    chat: {
      feeds,
      setFeeds,
      requests,
      setRequests,
      feedContent,
      setFeedContent,
      fetchingChats,
      chatHistoryLoaders,
      requestsContent,
      setRequestsContent,
      pinnedChats,
      setPinnedChats,
      lastSeenInfo,
      setLastSeenInfo,
      replyRef,
      setReplyRef,
      latestStreamMessage,
    },
    pushStream: pushStreamRef,
    activeChat,
    setActiveChat,
    chatSearch,
    setChatSearch,
    activeChatTab,
    setActiveChatTab,
    initializePushUser,
    contactBook,
    setContactBook,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
