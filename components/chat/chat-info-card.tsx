import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import {trimAddress} from "@/lib/utils";
import Image from "next/image";
import React from "react";
import {useEnsName} from "wagmi";

const ChatInfoCard = () => {
  const {activeChat} = useAppContext();
  const isAGroup = activeChat?.groupInformation?.chatId ? true : false;
  return (
    <div className="rounded-md h-20 mx-2 bg-gray-600  bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-row gap-4 items-center px-4">
      <Image
        src={
          isAGroup
            ? activeChat?.groupInformation?.groupImage || DEFAULT_PFP
            : activeChat?.profilePicture || DEFAULT_PFP
        }
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-12 h-12"
      />
      <div className="flex flex-col ">
        <p className="text-md font-medium">
          {isAGroup
            ? activeChat?.groupInformation?.groupName
            : trimAddress(activeChat?.did.slice(7)!)}
        </p>
      </div>
    </div>
  );
};

export default ChatInfoCard;
