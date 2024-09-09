import React from "react";
import ChatInfoCard from "./chat-info-card";
import ChatInput from "./chat-input";
import {useAppContext} from "@/hooks/use-app-context";
import {LockClosedIcon} from "@radix-ui/react-icons";
import ChatMessagesContainer from "./chat-history";
const ChatMessageWindow = () => {
  const {activeChat} = useAppContext();
  return (
    <>
      {activeChat ? (
        <div className="rounded-md h-full  flex flex-col flex-1 gap-2 py-1 bg-black border-[1px] border-gray-500 border-opacity-50">
          <ChatInfoCard />
          <ChatMessagesContainer />
          <ChatInput />
        </div>
      ) : (
        <div className="rounded-md h-full  flex flex-col flex-1 gap-2 py-1">
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            <p className="text-gray-400 text-md">Start a new conversation</p>
          </div>
          <div className="flex flex-row justify-center items-center py-4 text-muted-foreground">
            <LockClosedIcon className="w-4 h-4 mx-2 text-gray-400 " />
            <p className="text-sm">
              All messages are encrypted and can be only read by you. Secured by
              Push Network.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessageWindow;
