import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {convertUnixTimestamp, trimAddress} from "@/lib/utils";
import {IFeeds} from "@pushprotocol/restapi";
import Image from "next/image";
import React, {useEffect, useState} from "react";

const ChatItem = ({chat}: {chat: IFeeds}) => {
  const {resolveDomain} = usePush();
  const {setActiveChat} = useAppContext();
  const [isAGroup, setIsAGroup] = useState<boolean>(
    chat.groupInformation?.chatId ? true : false
  );

  const [chatName, setChatName] = useState<string>(
    chat.did
      ? trimAddress(chat.did.slice(7))
      : isAGroup
      ? (chat.groupInformation?.groupName as string)
      : ""
  );
  const timestamp = convertUnixTimestamp(chat.msg.timestamp!);

  const handleClick = () => {
    setActiveChat(chat);
  };
  useEffect(() => {
    const fetchChatName = async () => {
      if (!chat.did || chat.groupInformation?.chatId) {
        return;
      }
      const name = await resolveDomain(chat.did.slice(7));
      if ("error" in name) {
        return;
      }
      if (name.name.length > 0) {
        setChatName(name.name[0]);
      }
    };
    fetchChatName();
  }, []);
  return (
    <div
      className="relative flex flex-row px-4 items-center gap-3 py-4  cursor-pointer rounded-md hover:bg-gray-800/50 border-[1px] border-gray-800/50 hover:border-gray-800"
      onClick={handleClick}
    >
      <Image
        src={
          (isAGroup
            ? chat.groupInformation?.groupImage || DEFAULT_PFP
            : chat.profilePicture) || DEFAULT_PFP
        }
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col gap-2 w-full overflow-x-hidden">
        <div className="flex flex-row justify-between">
          <span className="text-sm font-medium leading-none w-[75%] text-nowrap text-ellipsis overflow-x-hidden">
            {chatName}
          </span>

          <span className="text-xs text-muted-foreground pl-1 w-[25%] text-right">
            {timestamp ?? ""}
          </span>
        </div>
        <span className="w-[90%] text-nowrap text-ellipsis overflow-x-hidden text-sm text-muted-foreground">
          {chat.msg.messageContent}
        </span>
      </div>
      {/* <div className="absolute flex justify-center items-center bottom-2 right-4 bg-[#24c55b] w-5 h-5 rounded-full">
        <p className="font-semibold text-muted text-sm">1</p>
      </div> */}
    </div>
  );
};

export default ChatItem;
