"use client";
import {CONSTANTS, PushAPI} from "@pushprotocol/restapi";
import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useAccount, useWalletClient} from "wagmi";

interface UserContextType {
  pushUser: PushAPI | undefined;
  setPushUser: (user: PushAPI | undefined) => void;
  pushStream: any;
  latestMessage: any;
  setLatestMessage: (message: any) => void;
}

const defaultContextValue: UserContextType = {
  pushUser: undefined,
  setPushUser: () => {},
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
  const initializeUser = async () => {
    console.log("Initializing user");
    const user = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.PROD,
    });
    setPushUser(user);
    if (pushStream.current && pushStream.current.disconnected === false) return;

    console.log("Setting up socket");
    const stream = await user.initStream([CONSTANTS.STREAM.CHAT]);
    console.log(stream);
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

  return (
    <UserContext.Provider
      value={{
        pushUser,
        setPushUser,
        pushStream,
        latestMessage,
        setLatestMessage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
