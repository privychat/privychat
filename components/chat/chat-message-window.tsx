import React from "react";
import ChatInfoCard from "./chat-info-card";

const ChatMessageWindow = () => {
  return (
    <div className="rounded-md h-full  flex flex-col flex-1 gap-2 py-1 bg-black border-[1px] border-gray-500 border-opacity-50">
      <ChatInfoCard />
    </div>
  );
};

export default ChatMessageWindow;
