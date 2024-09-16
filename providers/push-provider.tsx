"use client";

import {getUserKeys, playNotification, saveUserKeys} from "@/lib/utils";
import {IFeeds, IMessage, IStreamMessage} from "@/types";
import {usePrivy} from "@privy-io/react-auth";
import {CONSTANTS, IUser, PushAPI} from "@pushprotocol/restapi";
import {useEffect, useRef, useState} from "react";
import {useWalletClient} from "wagmi";
import {AppContext} from "@/context/app-context";
import {CHAT_TYPE, DEFAULT_PFP, STREAM_SOURCE} from "@/constants";

export default function AppProvider({children}: {children: React.ReactNode}) {
  // user account related stated
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  // chat related states
  const [feeds, setFeeds] = useState<IFeeds[] | null>(null);
  const feedsRef = useRef(feeds);
  const [requests, setRequests] = useState<IFeeds[] | null>(null);
  const [fetchingChats, setFetchingChats] = useState<{
    feeds: {
      allPagesFetched: boolean;
      fetching: boolean;
    };
    requests: {
      allPagesFetched: boolean;
      fetching: boolean;
    };
  }>({
    feeds: {
      allPagesFetched: false,
      fetching: false,
    },
    requests: {
      allPagesFetched: false,
      fetching: false,
    },
  });

  const [chatHistoryLoaders, setChatHistoryLoaders] = useState<{
    [key: string]: boolean;
  }>({});
  const [historyFetchedChats, setHistoryFetchedChats] = useState<{
    [key: string]: boolean;
  }>();
  // stores the last 15 messages for each chat
  const [feedContent, setFeedContent] = useState<{
    [key: string]: IMessage[] | null;
  }>({});
  const feedContentRef = useRef(feedContent);
  const [requestsContent, setRequestsContent] = useState<{
    [key: string]: IMessage[] | null;
  }>({});

  // incoming stream message from socket
  const [streamMessage, setStreamMessage] = useState<any | null>(null);

  // stream ref
  const pushStream = useRef<any | null>(null);

  // used to store the active chat, search query and active chat tab
  const [activeChat, setActiveChat] = useState<IFeeds | null>(null);
  const [chatSearch, setChatSearch] = useState<string>("");
  const [activeChatTab, setActiveChatTab] = useState<CHAT_TYPE>(CHAT_TYPE.ALL);

  // signer
  const {data: signer} = useWalletClient();
  // privy user
  const {user: privyUser, ready, authenticated} = usePrivy();

  const initializePushUser = async () => {
    try {
      const {userAccount, userKey} = getUserKeys();
      if (!userAccount && !userKey && !signer) return;
      const user = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.PROD,
        ...(userKey && {decryptedPGPPrivateKey: userKey}),
        ...(userAccount && {account: userAccount}),
      });

      if (!user.decryptedPgpPvtKey) {
        return;
      }
      saveUserKeys(user.decryptedPgpPvtKey!, user.account);
      setPushUser(user);
      setAccount(user.account);

      if (pushStream.current && pushStream.current.disconnected === false) {
        return;
      }

      const stream = await user.initStream([CONSTANTS.STREAM.CHAT]);
      stream.on(CONSTANTS.STREAM.CONNECT, async (a) => {
        console.log("Stream Connected");
      });
      stream.on(CONSTANTS.STREAM.DISCONNECT, async (a) => {
        console.log("Stream Disconnected");
      });

      // Chat message received:
      stream.on(CONSTANTS.STREAM.CHAT, (stream: IStreamMessage) => {
        if (
          stream.event === "chat.message" &&
          stream.origin !== STREAM_SOURCE.SELF
        ) {
          handleIncomingMessage(stream);

          if (origin != "self") {
            playNotification();
          }
        }
      });
      stream.on(CONSTANTS.STREAM.CHAT_OPS, (message) => {
        console.log("Chat Ops", message);
      });

      stream.connect();

      pushStream.current = stream;
    } catch (error) {
      console.error(error);
    }
  };

  const handleIncomingMessage = (streamMessage: IStreamMessage) => {
    const {chatId, from, message, timestamp, reference, origin, meta} =
      streamMessage;
    const currentFeedContent = feedContentRef.current;

    if (currentFeedContent.hasOwnProperty(chatId)) {
      console.log("Chat ID in feedContent");
      setFeedContent((prev) => {
        const currentChatHistory = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: [
            ...currentChatHistory,
            {
              cid: reference,
              from: from,
              to: chatId,
              timestamp: Number(timestamp),
              messageContent: {
                content: message.content,
              },
              link: reference,
              type: message.type,
            },
          ],
        };
      });
    } else {
      setRequestsContent((prev) => {
        return {
          ...prev,
          [chatId]: [
            {
              cid: reference,
              from: from,
              to: chatId,
              timestamp: Number(timestamp),
              messageContent: {
                content: message.content,
              },
              link: reference,
              type: message.type,
            },
          ],
        };
      });
    }

    const currentFeeds = feedsRef.current;
    if (currentFeeds?.find((feed) => feed.chatId === chatId)) {
      setFeeds((prev) => {
        if (!prev) return null;

        const updatedChats = prev.map((chat) => {
          if (chat.chatId === chatId) {
            return {
              ...chat,
              lastMessage: message.content,
              lastMessageTimestamp: Number(timestamp),
            };
          }
          return chat;
        });

        return updatedChats;
      });
    } else {
      setRequests((prev) => {
        if (!prev) return null;

        let chatExists = false;

        const updatedChats = prev.map((chat) => {
          if (chat.chatId === chatId) {
            chatExists = true;
            return {
              ...chat,
              lastMessage: message.content,
              lastMessageTimestamp: Number(timestamp),
            };
          }
          return chat;
        });

        if (!chatExists) {
          // Add a new entry if the activeChat.chatId was not found
          updatedChats.push({
            chatId: chatId,
            did: from,
            profilePicture: DEFAULT_PFP,
            lastMessage: message.content,
            lastMessageTimestamp: Number(timestamp),
            isGroup: meta.group,
          });
        }

        return updatedChats;
      });
    }
  };

  const getUserChats = async (page: number = 1) => {
    setFetchingChats((prev) => ({
      ...prev,
      feeds: {
        ...prev.feeds,
        fetching: true,
      },
    }));
    const chats = await pushUser?.chat.list("CHATS", {
      limit: 10,
      page,
    });

    if (chats) {
      setFetchingChats((prev) => ({
        ...prev,
        feeds: {
          ...prev.feeds,
          fetching: false,
        },
      }));
      const formattedChats = chats.map((chat) => {
        return {
          chatId: chat.chatId!,
          did: chat.did,
          lastMessage: chat.msg.messageContent,
          lastMessageTimestamp: Date.parse(chat.intentTimestamp.toString()),
          profilePicture:
            chat.profilePicture ||
            chat.groupInformation?.groupImage ||
            DEFAULT_PFP,
          isGroup: chat.groupInformation?.chatId ? true : false,
          groupName: chat.groupInformation?.groupName,
          groupParticipants: chat.groupInformation?.members,
        };
      });

      setFeeds((prevChats) => [...(prevChats || []), ...formattedChats]);
      if (chats.length === 0 || chats.length < 10) {
        setFetchingChats((prev) => ({
          ...prev,
          feeds: {
            ...prev.feeds,
            allPagesFetched: true,
          },
        }));
        return;
      }

      await getUserChats(page + 1);
    }
  };

  const getUserRequests = async (page: number = 1) => {
    const requests = await pushUser?.chat.list("REQUESTS", {
      limit: 10,
    });
    if (requests) {
      setFetchingChats((prev) => ({
        ...prev,
        requests: {
          ...prev.requests,
          fetching: false,
        },
      }));
      const formattedRequests = requests.map((chat) => {
        return {
          chatId: chat.chatId!,
          did: chat.did,
          lastMessage: chat.msg.messageContent,
          lastMessageTimestamp: Date.parse(chat.intentTimestamp.toString()),
          profilePicture:
            chat.profilePicture ||
            chat.groupInformation?.groupImage ||
            DEFAULT_PFP,
          isGroup: chat.groupInformation?.chatId ? true : false,
          groupName: chat.groupInformation?.groupName,
          groupParticipants: chat.groupInformation?.members,
        };
      });
      setRequests((prevRequests) => [
        ...(prevRequests || []),
        ...formattedRequests,
      ]);
      if (requests.length === 0 || requests.length < 10) {
        setFetchingChats((prev) => ({
          ...prev,
          requests: {
            ...prev.requests,
            allPagesFetched: true,
          },
        }));
        return;
      }

      await getUserRequests(page + 1);
    }
  };

  const getUserDetails = async () => {
    const user = await pushUser?.info();
    if (user) {
      setUserInfo(user);
    }
  };

  const getMessagesForLatestChats = async (
    feeds: IFeeds[],
    tab: "CHATS" | "REQUESTS"
  ) => {
    const historyPromises = feeds.map(async (feed) => {
      if (historyFetchedChats && historyFetchedChats[feed.chatId!]) return;
      setHistoryFetchedChats((prev) => ({
        ...prev,
        [feed.chatId!]: true,
      }));
      setChatHistoryLoaders((prev) => ({
        ...prev,
        [feed.chatId!]: true,
      }));
      const history = await pushUser?.chat.history(feed.chatId!, {
        limit: 15,
      });

      if (history) {
        const historyFormatted: IMessage[] = history
          .map((msg) => {
            return {
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
            };
          })
          .reverse();

        if (tab === "CHATS") {
          setFeedContent((prev) => ({
            ...prev,
            [feed.chatId!]: [
              ...(prev[feed.chatId!] || []),
              ...historyFormatted,
            ],
          }));
        } else if (tab === "REQUESTS") {
          setRequestsContent((prev) => ({
            ...prev,
            [feed.chatId!]: [
              ...(prev[feed.chatId!] || []),
              ...historyFormatted,
            ],
          }));
        }
        setChatHistoryLoaders((prev) => ({
          ...prev,
          [feed.chatId!]: false,
        }));
      }
    });

    await Promise.all(historyPromises);
  };
  useEffect(() => {
    feedContentRef.current = feedContent;
  }, [feedContent]);

  useEffect(() => {
    feedsRef.current = feeds;
  }, [feeds]);
  useEffect(() => {
    if (feeds && feeds.length > 0) getMessagesForLatestChats(feeds, "CHATS");
  }, [feeds]);
  useEffect(() => {
    if (requests && requests.length > 0)
      getMessagesForLatestChats(requests, "REQUESTS");
  }, [requests]);
  useEffect(() => {
    if (pushUser) {
      Promise.all([getUserChats(), getUserRequests(), getUserDetails()]);
    }
  }, [pushUser]);
  useEffect(() => {
    const localUser = getUserKeys();

    if (
      (localUser.userAccount && localUser.userKey) ||
      (authenticated && signer)
    ) {
      setIsUserAuthenticated(true);
    }
  }, [signer, authenticated, ready, privyUser]);
  useEffect(() => {
    initializePushUser();

    return () => {
      pushStream.current?.disconnect();
    };
  }, []);
  return (
    <AppContext.Provider
      value={{
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
        pushStream,
        setPushStream: pushStream.current,
        streamMessage,
        setStreamMessage,
        activeChat,
        setActiveChat,
        chatSearch,
        setChatSearch,
        activeChatTab,
        setActiveChatTab,
        initializePushUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
