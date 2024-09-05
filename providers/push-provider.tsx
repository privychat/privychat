"use client";

import {useToast} from "@/hooks/use-toast";
import usePush from "@/hooks/use-push";
import {getUserKeys, saveUserKeys} from "@/lib/utils";
import {IAppContext, IChat, IMessage} from "@/types";
import {usePrivy} from "@privy-io/react-auth";
import {CONSTANTS, IFeeds, IUser, PushAPI, user} from "@pushprotocol/restapi";
import {createContext, useEffect, useRef, useState} from "react";
import {useWalletClient} from "wagmi";

export const AppContext = createContext<IAppContext>({} as IAppContext);

export default function AppProvider({children}: {children: React.ReactNode}) {
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<IFeeds[] | null>(null);
  const [requests, setRequests] = useState<IFeeds[] | null>(null);
  const [feedContent, setFeedContent] = useState<{
    [key: string]: IMessage[] | null;
  }>({});
  const [streamMessage, setStreamMessage] = useState<any | null>(null);
  const pushStream = useRef<any | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<IFeeds | null>(null);
  const [chatSearch, setChatSearch] = useState<string>("");
  const [activeChatTab, setActiveChatTab] = useState<
    "all" | "requests" | "pinned" | "archived"
  >("all");
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
      stream.on(CONSTANTS.STREAM.CHAT, (message) => {
        console.log("Chat", message);
        setStreamMessage(message);
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
  const getUserChats = async () => {
    const startTime = Date.now();
    const chats = await pushUser?.chat.list("CHATS", {
      limit: 10,
    });
    console.log("Time taken to fetch chats", Date.now() - startTime);

    if (chats) {
      setFeeds(chats);
      await getMessagesForLatestChats(chats);
    }
  };

  const getUserRequests = async () => {
    const requests = await pushUser?.chat.list("REQUESTS", {
      limit: 10,
    });
    if (requests) {
      setRequests(requests);
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
      const history = await pushUser?.chat.history(feed.chatId!, {
        limit: 15,
      });

      if (history) {
        setFeedContent((prev) => ({...prev, [feed.chatId!]: history}));
      }
    });

    await Promise.all(historyPromises);
  };

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
        },
        setFeeds,
        setRequests,
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
