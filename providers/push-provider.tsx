"use client";
import usePush from "@/app/hooks/usePush";
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
  const [pushUser, setPushUser] = useState<PushAPI | undefined>();
  const pushStream = useRef<any>(undefined);
  const [latestMessage, setLatestMessage] = useState<any>();
  const [userInfo, setUserInfo] = useState<IUser | undefined>();
  const [userChats, setUserChats] = useState<IFeeds[] | undefined>();
  const [userChatRequests, setUserChatRequests] = useState<
    IFeeds[] | undefined
  >();
  const {fetchChats, fetchRequests} = usePush();
  const initializeUser = async () => {
    const user = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.PROD,
    });
    const userInfo = await user.info();

    setUserInfo(userInfo);
    setPushUser(user);
    await getChats();
    await getRequests();
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
      setLatestMessage(message);
    });

    stream.connect();

    pushStream.current = stream;
  };

  const getChats = async () => {
    if (!pushUser) return;
    const chats = await pushUser.chat.list("CHATS");

    if (!chats) return;
    setUserChats(chats);
  };

  const getRequests = async () => {
    if (!pushUser) return;
    const requests = await pushUser.chat.list("REQUESTS");

    if (!requests) return;
    setUserChatRequests(requests);
  };
  useEffect(() => {
    if (window.location.pathname === "/") return;
    if (!signer) return;
    if (pushUser) return;

    initializeUser();

    return () => {
      console.log("disconnecting stream");
      pushStream?.current?.disconnect();
    };
  }, [signer]);

  useEffect(() => {
    if (!pushUser) return;
    getChats();
    getRequests();
  }, [pushUser]);
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
