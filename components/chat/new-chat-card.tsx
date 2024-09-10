import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import {trimAddress} from "@/lib/utils";
import {IChat} from "@/types";
import Image from "next/image";
import React from "react";

const NewChatItem = ({address}: {address: string}) => {
  const {setActiveChat, chat: chatContext, activeChat} = useAppContext();
  const {setFeedContent} = chatContext as IChat;
  return (
    <div
      className={`relative flex flex-row px-4 w-full items-center gap-3 py-4  cursor-pointer rounded-md hover:bg-gray-800/50 border-[1px] border-gray-800/50 hover:border-gray-800 ${
        activeChat?.chatId === address && "bg-gray-800/50"
      }`}
      onClick={() => {
        setActiveChat({
          chatId: address,
          did: `eip155:${address}`,
          profilePicture: DEFAULT_PFP,
          groupInformation: {},
        });
        setFeedContent((prev) => ({
          ...prev,
          [address]: [],
        }));
      }}
    >
      <Image
        src={DEFAULT_PFP}
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col gap-2 w-full overflow-x-hidden">
        <span className="text-sm font-medium  w-[75%] text-nowrap text-ellipsis overflow-x-hidden">
          {trimAddress(address)}
        </span>
      </div>
    </div>
  );
};

export default NewChatItem;
