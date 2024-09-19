import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {convertUnixTimestamp, trimAddress} from "@/lib/utils";
import {IChat, IFeeds} from "@/types";
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
  const {feedContent} = chatContext as IChat;

  const [chatName, setChatName] = useState<string>();
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

  // useEffect(() => {
  //   const fetchChatName = async () => {
  //     if (!chat.did || chat.groupInformation?.chatId) {
  //       return;
  //     }
  //     const name = await reverseResolveDomain(chat.did.slice(7));
  //     if ("error" in name) {
  //       return;
  //     }
  //     if (name.name.length > 0) {
  //       setChatName(name.name[0]);
  //     }
  //   };
  //   fetchChatName();
  // }, []);
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
          <span className="text-sm font-medium  w-[75%] text-nowrap text-ellipsis overflow-x-hidden">
            {chatName}
          </span>

          <span className="text-xs text-muted-foreground pl-1 w-[25%] text-right">
            {timestamp ?? ""}
          </span>
        </div>
        <span className="w-[90%] text-nowrap text-ellipsis overflow-x-hidden text-sm text-muted-foreground">
          {chat.lastMessage}
        </span>
      </div>
      {/* <div className="absolute flex justify-center items-center bottom-2 right-4 bg-[#24c55b] w-5 h-5 rounded-full">
        <p className="font-semibold text-muted text-sm">1</p>
      </div> */}
    </div>
  );
};

export default ChatItem;
