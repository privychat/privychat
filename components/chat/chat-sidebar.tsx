import React, {useEffect, useState} from "react";
import ChatBadge from "../ui/chat-badge";
import {useAppContext} from "@/hooks/use-app-context";
import ChatItem from "./chat-item";
import ChatSearch from "./chat-search";
import ChatItemLoaderSkeleton from "../loaders/chat-item-loader-skeleton";
import {IChat} from "@/types";
import {CHAT_TYPE, SUPPORTED_DOMAINS} from "@/constants";

import usePush from "@/hooks/use-push";
import FetchingMoreMessagesLoader from "../loaders/fetching-messages-loaders";
import {isAddress} from "viem";
import NewChatItem from "./new-chat-card";

const ChatSidebar = ({openSheet}: {openSheet?: () => void}) => {
  const {activeChatTab, chatSearch, chat, account} = useAppContext();
  const {resolveDomain} = usePush();
  const {feeds} = chat as IChat;
  const [fetchingDomain, setFetchingDomain] = useState(false);
  const [resolvedDomain, setResolvedDomain] = useState<string | null>(null);
  const [filteredChats, setFilteredChats] = useState<any[] | undefined>();
  useEffect(() => {
    const filterChats = async () => {
      setResolvedDomain(null);
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
        if (filteredChats?.length === 0 && resolvedAddress) {
          setResolvedDomain(resolvedAddress);
        }
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

  return (
    <div className="rounded-md h-20  flex flex-col flex-1 gap-2 py-1 bg-black md:border-[1px] border-gray-500 border-opacity-50">
      <ChatSearch />
      <div className="flex flex-row gap-2 px-2">
        <ChatBadge text={CHAT_TYPE.ALL} />
        <ChatBadge text={CHAT_TYPE.REQUESTS} />
        <ChatBadge text={CHAT_TYPE.GROUPS} />
      </div>
      {filteredChats && (
        <section className="w-full h-full flex flex-1 flex-col overflow-y-auto">
          {fetchingDomain && <ChatItemLoaderSkeleton />}
          {filteredChats.length === 0 && chatSearch !== account && (
            <div className="flex flex-col gap-2 items-center mt-2 h-full">
              <p className="text-gray-400 text-md">
                No chats found, Start a new chat
              </p>
              {isAddress(chatSearch) && <NewChatItem address={chatSearch} />}

              {!fetchingDomain &&
                resolvedDomain &&
                resolvedDomain.toLowerCase() != account?.toLowerCase() && (
                  <NewChatItem address={resolvedDomain} name={chatSearch} />
                )}
            </div>
          )}
          {filteredChats
            .filter(
              (chat, index, self) =>
                index === self.findIndex((c) => c.did === chat.did)
            )
            .map((chat, index) => (
              <ChatItem key={index} chat={chat} />
            ))}
        </section>
      )}

      {!filteredChats && activeChatTab === CHAT_TYPE.REQUESTS && (
        <RequestsTab openSheet={openSheet} />
      )}
      {!filteredChats && activeChatTab === CHAT_TYPE.GROUPS && (
        <GroupsTab openSheet={openSheet} />
      )}
      {!filteredChats && activeChatTab === CHAT_TYPE.ALL && (
        <FeedsTab openSheet={openSheet} />
      )}
    </div>
  );
};

const FeedsTab = ({openSheet}: {openSheet?: () => void}) => {
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
        feeds.map((chat, index) => (
          <ChatItem
            key={index}
            chat={chat}
            {...(openSheet ? {openSheet: openSheet} : {})}
          />
        ))}
      {chat && feeds && feeds.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">Start a new conversation</p>
        </div>
      )}

      {chat && feeds && (
        <FetchingMoreMessagesLoader showLoader={fetchingChats.feeds.fetching} />
      )}
    </section>
  );
};
const RequestsTab = ({openSheet}: {openSheet?: () => void}) => {
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
        requests.map((chat, index) => (
          <ChatItem
            key={index}
            chat={chat}
            {...(openSheet ? {openSheet: openSheet} : {})}
          />
        ))}
      {chat && requests && requests.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">No pending requests</p>
        </div>
      )}
      {chat && requests && (
        <FetchingMoreMessagesLoader
          showLoader={fetchingChats.requests.fetching}
        />
      )}
    </section>
  );
};

const GroupsTab = ({openSheet}: {openSheet?: () => void}) => {
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
          .map((chat, index) => (
            <ChatItem
              key={index}
              chat={chat}
              {...(openSheet ? {openSheet: openSheet} : {})}
            />
          ))}
      {chat && feeds && feeds.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">No active group chats</p>
        </div>
      )}
      {chat && feeds && (
        <FetchingMoreMessagesLoader showLoader={fetchingChats.feeds.fetching} />
      )}
    </section>
  );
};

export default ChatSidebar;
