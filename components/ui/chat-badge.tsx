import React from "react";
import {Badge} from "./badge";
import {useAppContext} from "@/hooks/use-app-context";

const ChatBadge = ({
  text,
}: {
  text: "all" | "requests" | "pinned" | "archived" | "groups";
}) => {
  const {activeChatTab, setActiveChatTab, chat} = useAppContext();
  const handleTabChange = () => {
    setActiveChatTab(text);
  };

  return (
    <Badge
      variant={`${activeChatTab === text ? "default" : "secondary"}`}
      className={`text-[16px] font-light px-4 py-[4px] ${
        activeChatTab === text
          ? "font-medium text-white hover:bg-primary cursor-default"
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
