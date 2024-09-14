"use client";

import {getUserKeys, playNotification, saveUserKeys} from "@/lib/utils";
import {IAppContext, IChat, IMessage, IStreamMessage} from "@/types";
import {usePrivy} from "@privy-io/react-auth";
import {CONSTANTS, IFeeds, IUser, PushAPI} from "@pushprotocol/restapi";
import {createContext, useEffect, useRef, useState} from "react";
import {useWalletClient} from "wagmi";
import {AppContext} from "@/context/app-context";
import {CHAT_TYPE, MESSAGE_TYPE, STREAM_SOURCE} from "@/constants";

export default function AppProvider({children}: {children: React.ReactNode}) {
  // user account related stated
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  // chat related states
  const [feeds, setFeeds] = useState<IFeeds[] | null>(null);
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
  const [lastFetchedChat, setLastFetchedChat] = useState<number | null>(null);

  // stores the last 15 messages for each chat
  const [feedContent, setFeedContent] = useState<{
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
      if (!userAccount && !userKey) return;
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
          const {chatId, from, message, timestamp, reference, origin} = stream;
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

          setStreamMessage(stream);
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
      setFeeds((prevChats) => [...(prevChats || []), ...chats]);
      if (chats.length === 0) {
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

  const getUserRequests = async () => {
    const requests = await pushUser?.chat.list("REQUESTS", {
      limit: 10,
    });
    if (requests) {
      setRequests(requests);
      await getMessagesForLatestChats(requests);
    }
  };

  const getUserDetails = async () => {
    const user = await pushUser?.info();
    if (user) {
      setUserInfo(user);
    }
  };

  const getMessagesForLatestChats = async (feeds: IFeeds[]) => {
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

        setFeedContent((prev) => ({
          ...prev,
          [feed.chatId!]: [...(prev[feed.chatId!] || []), ...historyFormatted],
        }));
        setChatHistoryLoaders((prev) => ({
          ...prev,
          [feed.chatId!]: false,
        }));
      }
    });

    await Promise.all(historyPromises);
  };

  useEffect(() => {
    if (feeds && feeds.length > 0) getMessagesForLatestChats(feeds);
  }, [feeds]);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
