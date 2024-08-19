"use client";
import {usePrivy, useWallets} from "@privy-io/react-auth";
import {CONSTANTS, IFeeds, IUser, PushAPI} from "@pushprotocol/restapi";
import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useAccount, useWalletClient} from "wagmi";

interface UserContextType {
  pushUser: PushAPI | undefined;
  setPushUser: (user: PushAPI | undefined) => void;
  userInfo: IUser | undefined;
  setUserInfo: (userInfo: IUser | undefined) => void;
  userChatRequests: IFeeds[] | undefined;
  setUserChatRequests: (requests: IFeeds[] | undefined) => void;
  userChats: IFeeds[] | undefined;
  setUserChats: (chats: IFeeds[] | undefined) => void;

  pushStream: any;
  latestMessage: any;
  setLatestMessage: (message: any) => void;
}

const defaultContextValue: UserContextType = {
  pushUser: undefined,
  setPushUser: () => {},
  userInfo: undefined,
  setUserInfo: () => {},
  userChatRequests: undefined,
  setUserChatRequests: () => {},
  userChats: undefined,
  setUserChats: () => {},

  pushStream: undefined,
  latestMessage: undefined,
  setLatestMessage: () => {},
};

export const UserContext = createContext<UserContextType>(defaultContextValue);

export const usePushUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("usePushUser must be used within a PushUserProvider");
  }
  return context;
};

export default function PushUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {data: signer} = useWalletClient();
  const {authenticated, user: privyUser} = usePrivy();
  const [pushUser, setPushUser] = useState<PushAPI | undefined>();
  const pushStream = useRef<any>(undefined);
  const [latestMessage, setLatestMessage] = useState<any>();
  const [userInfo, setUserInfo] = useState<IUser | undefined>();
  const [userChats, setUserChats] = useState<IFeeds[] | undefined>();
  const [userChatRequests, setUserChatRequests] = useState<
    IFeeds[] | undefined
  >();
  const {wallets} = useWallets();

  const initializeUser = async () => {
    const decryptedPgpPvtKey = localStorage.getItem("userKey");
    const userAccount = localStorage.getItem("userAccount");
    if (!decryptedPgpPvtKey && !userAccount && !signer) return;

    if (wallets[0]?.address !== signer?.account?.address) return;
    const user = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.PROD,
      ...(decryptedPgpPvtKey && {decryptedPGPPrivateKey: decryptedPgpPvtKey}),
      ...(userAccount && {account: userAccount}),
    });

    localStorage.setItem("userKey", user.decryptedPgpPvtKey!);
    localStorage.setItem("userAccount", user.account!);

    setPushUser(user);

    const [userInfo, userChats, userChatRequests] = await Promise.all([
      user.info(),
      getChats(),
      getRequests(),
    ]);

    setUserInfo(userInfo);
    if (pushStream.current && pushStream.current.disconnected === false) return;

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
      setLatestMessage(message);
    });
    stream.on(CONSTANTS.STREAM.CHAT_OPS, (message) => {
      console.log("Chat Ops", message);
    });

    stream.connect();

    pushStream.current = stream;
  };

  const getChats = async () => {
    if (!pushUser) return;
    const chats = await pushUser.chat.list("CHATS", {
      limit: 10,
    });

    if (!chats) return;
    setUserChats(chats);

    let pagesAvailable = true;
    let page = 1;
    while (pagesAvailable) {
      const olderChats = await pushUser.chat.list("CHATS", {
        limit: 30,
        page,
      });
      if (!olderChats) {
        pagesAvailable = false;
        break;
      } else {
        if (page > 1) setUserChats((prev) => [...(prev ?? []), ...olderChats]);
        else setUserChats(olderChats);
        page++;
      }
    }
  };

  const getRequests = async () => {
    if (!pushUser) return;
    const requests = await pushUser.chat.list("REQUESTS", {
      limit: 10,
    });

    if (!requests) return;
    setUserChatRequests(requests);
  };
  useEffect(() => {
    if (pushUser || !authenticated) return;

    initializeUser();

    return () => {
      console.log("disconnecting stream");
      pushStream?.current?.disconnect();
    };
  }, [privyUser, signer]);

  useEffect(() => {
    if (!pushUser) return;
    getChats();
    getRequests();
  }, [pushUser]);

  useEffect(() => {
    if (!pushUser) return;
    if (latestMessage.origin === "internal") return;
    getChats();
    getRequests();
  }, [latestMessage]);
  return (
    <UserContext.Provider
      value={{
        pushUser,
        setPushUser,
        userInfo,
        setUserInfo,
        userChatRequests,
        setUserChatRequests,
        userChats,
        setUserChats,
        pushStream,
        latestMessage,
        setLatestMessage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
