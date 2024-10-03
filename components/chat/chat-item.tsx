import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {convertUnixTimestamp, trimAddress} from "@/lib/utils";
import {IChat, IFeeds} from "@/types";
import {Pin} from "lucide-react";
import Image from "next/image";
import React, {useEffect, useState} from "react";

const ChatItem = ({
  chat,
  openSheet,
}: {
  chat: IFeeds;
  openSheet?: () => void;
}) => {
  const {reverseResolveDomain} = usePush();
  const {
    setActiveChat,
    chat: chatContext,
    activeChat,
    contactBook,
  } = useAppContext();
  const {pinnedChats, lastSeenInfo, feedContent} = chatContext as IChat;

  const [chatName, setChatName] = useState<string>();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const timestamp = convertUnixTimestamp(chat.lastMessageTimestamp!);

  useEffect(() => {
    if (chat?.did?.slice(7) in contactBook) {
      setChatName(contactBook[chat.did.slice(7)]);
    } else if (chat.isGroup) {
      setChatName(chat?.groupName as string);
    } else {
      setChatName(trimAddress(chat.did.slice(7)));
    }
  }, [chat, contactBook]);

  useEffect(() => {
    const fetchChatName = async () => {
      if (!chat.did || chat.isGroup) {
        return;
      }
      const name = await reverseResolveDomain(chat.did.slice(7));
      if ("error" in name) {
        return;
      }
      if (name.name.length > 0) {
        setChatName(name.name[0]);
      }
    };
    fetchChatName();
  }, [chat, reverseResolveDomain]);

  useEffect(() => {
    if (lastSeenInfo.length === 0 || !feedContent[chat.chatId]) return;
    const chatInLastSeenInfo = lastSeenInfo.find(
      (info) => info.chatId === chat.chatId
    );

    if (!chatInLastSeenInfo) return;

    const unreadMessagesCount = feedContent[chat.chatId]?.filter(
      (message) => message.timestamp > chatInLastSeenInfo.timestamp
    ).length;
    if (unreadMessagesCount) setUnreadMessages(unreadMessagesCount);
  }, [lastSeenInfo, chat, feedContent]);
  return (
    <div
      className={`relative flex flex-row px-4 items-center gap-3 py-4  cursor-pointer rounded-md hover:bg-gray-800/50 border-[1px] border-gray-800/50 hover:border-gray-800 ${
        activeChat?.chatId === chat.chatId && "bg-gray-800/50"
      }`}
      onClick={() => {
        setActiveChat(chat);

        if (openSheet) {
          openSheet();
        }
      }}
    >
      <Image
        src={chat.profilePicture}
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col gap-2 w-full overflow-x-hidden">
        <div className="flex flex-row justify-between">
          <span className="text-sm font-medium  flex-1 text-nowrap text-ellipsis overflow-x-hidden">
            {chatName}
          </span>

          <span className="text-xs text-muted-foreground pl-1 w-fit text-right">
            {timestamp ?? ""}
          </span>
        </div>
        <div className="flex flex-row gap-2 justify-between">
          <span className="w-[90%] text-nowrap text-ellipsis overflow-x-hidden text-sm text-muted-foreground">
            {chat.lastMessage}
          </span>
          <div className="flex justify-center items-center">
            {pinnedChats.includes(chat.chatId) && (
              <Pin size={"14px"} className="ml-20" />
            )}
            {unreadMessages > 0 && (
              <div className="flex justify-center items-center bg-[#24c55b] w-4 h-4 rounded-full ml-2 ">
                <p
                  className="font-semibold text-muted text-xs p-0 m-0 "
                  style={{lineHeight: "4px"}}
                >
                  {unreadMessages > 10 ? "10+" : unreadMessages}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
