import React from "react";
import ChatInfoCard from "./chat-info-card";
import ChatInput from "./chat-input";
import ChatHistoryContainer from "./chat-history-container";
import {useAppContext} from "@/hooks/use-app-context";

const ChatMessageWindow = () => {
  const {activeChat} = useAppContext();
  return (
    <>
      {activeChat ? (
        <div className="rounded-md h-full  flex flex-col flex-1 gap-2 py-1 bg-black border-[1px] border-gray-500 border-opacity-50">
          <ChatInfoCard />
          <ChatHistoryContainer />
          <ChatInput />
        </div>
      ) : (
        <div>hi</div>
      )}
    </>
  );
};

export default ChatMessageWindow;
