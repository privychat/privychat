import React from "react";
import {Badge} from "./badge";
import {useAppContext} from "@/hooks/use-app-context";
import {CHAT_TYPE} from "@/constants";

const ChatBadge = ({text}: {text: CHAT_TYPE}) => {
  const {activeChatTab, setActiveChatTab, chat} = useAppContext();
  const handleTabChange = () => {
    setActiveChatTab(text);
  };

  return (
    <Badge
      variant={`${activeChatTab === text ? "default" : "secondary"}`}
      className={`text-[13px] px-3 py-[4px] rounded-full font-light ${
        activeChatTab === text
          ? "text-white hover:bg-primary cursor-default"
          : "cursor-pointer"
      }`}
      onClick={handleTabChange}
    >
      {text.charAt(0).toUpperCase()}
      {text.slice(1, text.length)}
      {text === "requests" &&
        chat &&
        chat.requests &&
        chat?.requests?.length > 0 &&
        ` (${chat.requests.length})`}
    </Badge>
  );
};

export default ChatBadge;
