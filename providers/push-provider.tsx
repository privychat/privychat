"use client";
import React, {useEffect, useRef, useState, useCallback} from "react";
import {usePrivy} from "@privy-io/react-auth";
import {useWalletClient} from "wagmi";
import {CONSTANTS, IUser, PushAPI} from "@pushprotocol/restapi";
import {AppContext} from "@/context/app-context";
import {CHAT_TYPE, DEFAULT_PFP, STREAM_SOURCE} from "@/constants";
import {getUserKeys, playNotification, saveUserKeys} from "@/lib/utils";
import {IFeeds, IMessage, IStreamMessage} from "@/types";

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

  // UI state
  const [activeChat, setActiveChat] = useState<IFeeds | null>(null);
  const [chatSearch, setChatSearch] = useState<string>("");
  const [activeChatTab, setActiveChatTab] = useState<CHAT_TYPE>(CHAT_TYPE.ALL);

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
        env: CONSTANTS.ENV.STAGING,
        decryptedPGPPrivateKey: userKey,
        account: userAccount,
      });

      if (!user.decryptedPgpPvtKey) return;

      saveUserKeys(user.decryptedPgpPvtKey, user.account);
      setPushUser(user);
      setAccount(user.account);

      if (pushStreamRef.current?.disconnected === false) return;

      const stream = await user.initStream([CONSTANTS.STREAM.CHAT]);
      setupStreamListeners(stream);
      stream.connect();

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
    if (stream.event !== "chat.message" || stream.origin === STREAM_SOURCE.SELF)
      return;

    const {chatId, from, message, timestamp, reference, meta} = stream;
    const isGroup = meta.group;
    const newMessage: IMessage = {
      cid: reference,
      from,
      to: chatId,
      timestamp: Number(timestamp),
      messageContent: {content: message.content},
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

        const formattedChats = chats.map(formatChat);
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

        const formattedRequests = requests.map(formatChat);
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
                content: msg.messageObj?.content ?? "",
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
      Promise.all([getUserChats(), getUserRequests(), getUserDetails()]);
    }
  }, [pushUser, getUserChats, getUserRequests, getUserDetails]);

  useEffect(() => {
    const localUser = getUserKeys();
    setIsUserAuthenticated(
      !!(
        (localUser.userAccount && localUser.userKey) ||
        (authenticated && signer)
      )
    );
  }, [signer, authenticated, ready, privyUser]);

  useEffect(() => {
    initializePushUser();
    return () => {
      pushStreamRef.current?.disconnect();
    };
  }, [initializePushUser]);

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
    },
    pushStream: pushStreamRef,
    activeChat,
    setActiveChat,
    chatSearch,
    setChatSearch,
    activeChatTab,
    setActiveChatTab,
    initializePushUser,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
