import React, {useEffect, useRef, useState} from "react";
import ChatBadge from "../ui/chat-badge";
import {useAppContext} from "@/hooks/use-app-context";
import ChatItem from "./chat-item";
import ChatSearch from "./chat-search";
import {Separator} from "@/components/ui/separator";
import ChatItemLoaderSkeleton from "./chat-item-loader-skeleton";
import {IChat} from "@/types";
import {CHAT_TYPE, SUPPORTED_DOMAINS} from "@/constants";
import {IFeeds} from "@pushprotocol/restapi";
import usePush from "@/hooks/use-push";

const ChatSidebar = () => {
  const {activeChatTab, chatSearch, chat} = useAppContext();
  const {resolveDomain} = usePush();
  const {feeds, feedContent} = chat as IChat;
  const [fetchingDomain, setFetchingDomain] = useState(false);

  const [filteredChats, setFilteredChats] = useState<any[] | undefined>();
  useEffect(() => {
    const filterChats = async () => {
      if (chatSearch === "") {
        setFilteredChats(undefined);
        return;
      }
      const search = chatSearch.toLowerCase();

      if (SUPPORTED_DOMAINS.includes(search.split(".")[1])) {
        setFetchingDomain(true);
        // fetch address for the domain
        const resolvedAddress = await resolveDomain(search);

        if (resolvedAddress === null) {
          setFilteredChats([]);
          return;
        }
        const filteredChats = feeds?.filter((chat) => {
          if (
            chat?.did?.slice(7)?.toLowerCase() == resolvedAddress.toLowerCase()
          ) {
            return chat;
          }
        });
        setFilteredChats(filteredChats);
        setFetchingDomain(false);
      } else {
        const updatedFilteredChats = feeds?.filter((chat) => {
          if (chat.groupInformation?.groupName) {
            return chat.groupInformation.groupName
              .toLowerCase()
              .includes(search.toLowerCase());
          }
          return chat.did
            ?.slice(7)
            .toLowerCase()
            .includes(search.toLowerCase());
        });

        setFilteredChats(updatedFilteredChats);
      }
    };
    filterChats();
  }, [chatSearch]);

  // whenever there is an stream message, sort the sidebar chats
  // useEffect(() => {
  //   const sortChats = () => {
  //     const sortedChats = feeds?.sort((a, b) => {
  //       if (a.msg.timestamp && b.msg.timestamp) {
  //         return b.msg.timestamp - a.msg.timestamp;
  //       }
  //       return 0;
  //     });
  //     console.log("sorted chats", sortedChats);
  //   };
  //   sortChats();
  // }, [feedContent]);
  return (
    <div className="rounded-md h-20  flex flex-col flex-1 gap-2 py-1 bg-black border-[1px] border-gray-500 border-opacity-50">
      <ChatSearch />
      <div className="flex flex-row gap-2 px-2">
        <ChatBadge text={CHAT_TYPE.ALL} />
        <ChatBadge text={CHAT_TYPE.REQUESTS} />
        <ChatBadge text={CHAT_TYPE.GROUPS} />
      </div>
      {filteredChats && (
        <section className="w-full h-full flex flex-1 flex-col overflow-y-auto">
          {fetchingDomain && <ChatItemLoaderSkeleton />}
          {filteredChats.length === 0 && (
            <div className="flex flex-col gap-2 items-center justify-center h-full">
              <p className="text-gray-400 text-md">No chats found</p>
            </div>
          )}
          {filteredChats.map((chat, index) => (
            <ChatItem key={index} chat={chat} />
          ))}
        </section>
      )}
      {!filteredChats && activeChatTab === CHAT_TYPE.ALL && <FeedsTab />}
      {!filteredChats && activeChatTab === CHAT_TYPE.REQUESTS && (
        <RequestsTab />
      )}
      {!filteredChats && activeChatTab === CHAT_TYPE.GROUPS && <GroupsTab />}
    </div>
  );
};

const FeedsTab = () => {
  const {chat, chatSearch} = useAppContext();

  const {feeds, fetchingChats} = chat as IChat;

  return (
    <section className="w-full h-full flex-1 flex flex-col overflow-y-auto">
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

      {chat && feeds && feeds.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">Start a new conversation</p>
        </div>
      )}

      <FetchingMoreMessagesLoader showLoader={fetchingChats.feeds.fetching} />
    </section>
  );
};
const RequestsTab = () => {
  const {chat} = useAppContext();

  const {requests, fetchingChats} = chat as IChat;

  return (
    <section className="w-full h-full flex flex-1 flex-col overflow-y-auto">
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
      {chat && requests && requests.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">No pending requests</p>
        </div>
      )}
      <FetchingMoreMessagesLoader
        showLoader={fetchingChats.requests.fetching}
      />
    </section>
  );
};

const GroupsTab = () => {
  const {chat} = useAppContext();

  const {feeds, fetchingChats} = chat as IChat;

  return (
    <section className="w-full h-full flex-1 flex flex-col overflow-y-auto">
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
      {chat && feeds && feeds.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">No active group chats</p>
        </div>
      )}
      <FetchingMoreMessagesLoader showLoader={fetchingChats.feeds.fetching} />
    </section>
  );
};

export const FetchingMoreMessagesLoader = ({
  showLoader,
  text,
}: {
  showLoader?: boolean;
  text?: string;
}) => {
  return (
    <div
      className={`flex flex-row justify-center items-center gap-2 py-4 ${
        showLoader ? "" : "opacity-0"
      }`}
    >
      <div className="bg-primary w-1 h-1 animate-ping rounded-full"></div>
      <div className="bg-primary w-1.5 h-1.5 animate-ping rounded-full"></div>
      <div className="bg-primary w-2 h-2 animate-ping rounded-full"></div>
      <p className="text-muted-foreground text-sm">
        {text ?? "Fetching more chats"}
      </p>
      <div className="bg-primary w-2 h-2 animate-ping rounded-full"></div>
      <div className="bg-primary w-1.5 h-1.5 animate-ping rounded-full"></div>
      <div className="bg-primary w-1 h-1 animate-ping rounded-full"></div>
    </div>
  );
};

export default ChatSidebar;
