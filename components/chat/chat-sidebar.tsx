import React, {useRef} from "react";
import ChatBadge from "../ui/chat-badge";
import {useAppContext} from "@/hooks/use-app-context";
import ChatItem from "./chat-item";
import ChatSearch from "./chat-search";
import {Separator} from "@/components/ui/separator";
import ChatItemLoaderSkeleton from "./chat-item-loader-skeleton";
import {IChat} from "@/types";
import {CHAT_TYPE} from "@/constants";

const ChatSidebar = () => {
  const {activeChatTab} = useAppContext();
  return (
    <div className="rounded-md h-20  flex flex-col flex-1 gap-2 py-1 bg-black border-[1px] border-gray-500 border-opacity-50">
      <ChatSearch />
      <div className="flex flex-row gap-2 px-2">
        <ChatBadge text="all" />
        <ChatBadge text="requests" />
        <ChatBadge text="groups" />
      </div>
      <Separator className="w-[96%] m-auto" />
      {activeChatTab === CHAT_TYPE.ALL && <FeedsTab />}
      {activeChatTab === CHAT_TYPE.REQUESTS && <RequestsTab />}
      {activeChatTab === CHAT_TYPE.GROUPS && <GroupsTab />}
    </div>
  );
};

const FeedsTab = () => {
  const {chat} = useAppContext();

  const {feeds, fetchingChats} = chat as IChat;

  return (
    <section className="w-full h-full flex flex-col overflow-y-auto">
      <div className={`flex flex-col flex-1 h-full overflow-y-auto`}>
        {!feeds && (
          <>
            {Array.from({length: 10}).map((_, index) => (
              <ChatItemLoaderSkeleton key={index} />
            ))}
          </>
        )}
        {chat &&
          feeds &&
          feeds.map((chat, index) => <ChatItem key={index} chat={chat} />)}
        <FetchingMoreMessagesLoader showLoader={fetchingChats.feeds.fetching} />
      </div>
    </section>
  );
};
const RequestsTab = () => {
  const {chat} = useAppContext();

  const {requests, fetchingChats} = chat as IChat;

  return (
    <section className="w-full h-full flex flex-col overflow-y-auto">
      <div className={`flex flex-col flex-1 h-full overflow-y-auto`}>
        {!requests && (
          <>
            {Array.from({length: 10}).map((_, index) => (
              <ChatItemLoaderSkeleton key={index} />
            ))}
          </>
        )}
        {chat &&
          requests &&
          requests.map((chat, index) => <ChatItem key={index} chat={chat} />)}
        <FetchingMoreMessagesLoader
          showLoader={fetchingChats.requests.fetching}
        />
      </div>
    </section>
  );
};

const GroupsTab = () => {
  const {chat} = useAppContext();

  const {feeds, fetchingChats} = chat as IChat;

  return (
    <section className="w-full h-full flex flex-col overflow-y-auto">
      <div className={`flex flex-col flex-1 h-full overflow-y-auto`}>
        {!feeds && (
          <>
            {Array.from({length: 10}).map((_, index) => (
              <ChatItemLoaderSkeleton key={index} />
            ))}
          </>
        )}
        {chat &&
          feeds &&
          feeds
            .filter((chat) => chat.groupInformation?.chatId)
            .map((chat, index) => <ChatItem key={index} chat={chat} />)}
        <FetchingMoreMessagesLoader showLoader={fetchingChats.feeds.fetching} />
      </div>
    </section>
  );
};

const FetchingMoreMessagesLoader = ({showLoader}: {showLoader?: boolean}) => {
  return (
    <div
      className={`flex flex-row justify-center items-center gap-2 py-4 ${
        showLoader ? "" : "opacity-0"
      }`}
    >
      <div className="bg-primary w-1 h-1 animate-ping rounded-full"></div>
      <div className="bg-primary w-1.5 h-1.5 animate-ping rounded-full"></div>
      <div className="bg-primary w-2 h-2 animate-ping rounded-full"></div>
      <p className="text-muted-foreground">Fetching more chats</p>
      <div className="bg-primary w-2 h-2 animate-ping rounded-full"></div>
      <div className="bg-primary w-1.5 h-1.5 animate-ping rounded-full"></div>
      <div className="bg-primary w-1 h-1 animate-ping rounded-full"></div>
    </div>
  );
};

export default ChatSidebar;
