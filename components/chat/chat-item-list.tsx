import React, {useEffect, useState} from "react";
import ChatItem from "./chat-item";
import {IFeeds} from "@pushprotocol/restapi";
import {Search} from "lucide-react";
import {Input} from "../ui/input";
import {useEnsAddress, useEnsName} from "wagmi";
import {normalize} from "viem/ens";
import {isAddress} from "viem";
interface ChatItemListProps {
  chats: IFeeds[];
  selectedChat?: string;
  isInRequestsTab?: boolean;
}
const ChatItemList: React.FC<ChatItemListProps> = ({
  chats,
  selectedChat,
  isInRequestsTab,
}) => {
  const [search, setSearch] = useState("");
  const [filteredChats, setFilteredChats] = useState<IFeeds[] | any[]>([]);
  const {data: addressForENSNameSearchInput} = useEnsAddress({
    name: search,
    chainId: 1,
  });
  const filterChatWhileSearching = (chats: IFeeds[]) => {
    if (search.length === 0) return;

    const searchTerm = search.includes(".eth")
      ? addressForENSNameSearchInput ?? search
      : search;
    const newFilteredChats = chats.filter(
      (chat) =>
        (chat.did && chat.did.slice(7).includes(searchTerm)) ||
        (chat.chatId && chat.chatId.includes(searchTerm)) ||
        (chat.groupInformation &&
          chat.groupInformation.groupName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );

    // if the search is a valid address and its not in the chats list, add it to the filtered chats
    if (isAddress(searchTerm) && newFilteredChats.length === 0) {
      setFilteredChats([
        {
          did: `eip155:${searchTerm}`,
        },
      ]);
    } else {
      // Only update state if there's an actual change
      if (JSON.stringify(newFilteredChats) !== JSON.stringify(filteredChats)) {
        setFilteredChats(newFilteredChats);
      }
    }
  };

  useEffect(() => {
    filterChatWhileSearching(chats);
  }, [search]);

  return (
    <div className="max-w-[400px] w-[400px]">
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search...vitalik.eth"
          className="w-full rounded-lg bg-background pl-8 py-5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {chats &&
        search === "" &&
        chats.map((chat) => {
          const isGroupChat = chat.groupInformation !== null;
          if (chat.chatId === undefined) return;
          return (
            <ChatItem
              key={chat.chatId}
              chatIcon={chat.profilePicture ?? ""}
              chatName={
                isGroupChat ? (chat.chatId as string) : chat.did.slice(7)
              }
              chatMessage={chat.msg.messageContent}
              chatTimeStamp={chat.msg.timestamp}
              active={
                selectedChat === (isGroupChat ? chat.chatId : chat.did.slice(7))
              }
              isItARequest={isInRequestsTab ?? false}
              groupName={chat.groupInformation?.groupName}
            />
          );
        })}
      {filteredChats.length > 0 &&
        filteredChats.map((chat) => {
          const isGroupChat = chat.groupInformation !== undefined;

          // if (chat.chatId === undefined) return;
          return (
            <ChatItem
              key={chat.chatId ?? chat.did.slice(7)}
              chatIcon={chat.profilePicture ?? ""}
              chatName={isGroupChat ? chat.chatId : chat.did.slice(7)}
              chatMessage={chat?.msg?.messageContent ?? ""}
              chatTimeStamp={chat?.msg?.timestamp ?? ""}
              active={
                selectedChat === (isGroupChat ? chat.chatId : chat.did.slice(7))
              }
              isItARequest={isInRequestsTab ?? false}
              groupName={chat?.groupInformation?.groupName}
            />
          );
        })}
    </div>
  );
};

export default ChatItemList;
