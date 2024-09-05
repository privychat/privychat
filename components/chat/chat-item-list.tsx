import React, {useEffect, useRef, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "../ui/badge";
import ChatBadge from "../ui/chat-badge";
import {useAppContext} from "@/hooks/use-app-context";
import {ChatType} from "@/constants";
import ChatItem from "./chat-item";
import ChatSearch from "./chat-search";
import {Separator} from "@/components/ui/separator";

const ChatItemList = () => {
  const [fetchingMessagesLoader, setFetchingMessagesLoader] = useState(false);
  const {chat, setFeeds, setRequests, activeChatTab} = useAppContext();

  const handleScroll = () => {
    const chatsDiv = document.getElementById("chats");
    if (!chatsDiv) return;

    const {scrollTop, clientHeight, scrollHeight} = chatsDiv;

    if (scrollTop + clientHeight >= scrollHeight) {
      setFetchingMessagesLoader(true);
    }
  };

  useEffect(() => {
    const chatsDiv = document.getElementById("chats");
    if (!chatsDiv) return;

    chatsDiv.addEventListener("scroll", handleScroll);

    return () => {
      chatsDiv.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="rounded-md h-20  flex flex-col flex-1 gap-2 py-1 bg-black border-[1px] border-gray-500 border-opacity-50">
      <ChatSearch />
      <div className="grid grid-cols-2 px-2  xl:flex xl:flex-row gap-2">
        <ChatBadge text="all" />
        <ChatBadge text="requests" />
        <ChatBadge text="pinned" />
        <ChatBadge text="archived" />
      </div>
      <Separator className="w-[96%] m-auto" />
      <section className="w-full h-full flex flex-col overflow-y-auto">
        <div
          className={`flex flex-col flex-1 h-full overflow-y-auto`}
          id="chats"
        >
          {chat &&
            activeChatTab === ChatType.ALL &&
            chat.feeds &&
            chat.feeds.map((chat, index) => (
              <ChatItem key={index} chat={chat} />
            ))}

          {chat &&
            activeChatTab === ChatType.REQUESTS &&
            chat.requests &&
            chat.requests.map((chat, index) => (
              <ChatItem key={index} chat={chat} />
            ))}
          {fetchingMessagesLoader && (
            <div className="flex justify-center items-center">
              Fetching more messages...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ChatItemList;
