import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {trimAddress} from "@/lib/utils";
import Image from "next/image";
import React, {useEffect, useState} from "react";

const ChatInfoCard = () => {
  const {activeChat} = useAppContext();
  const {reverseResolveDomain} = usePush();
  const isAGroup = activeChat?.groupInformation?.chatId ? true : false;
  const [chatName, setChatName] = useState<string>();
  const fetchDomainName = async () => {
    if (!activeChat?.did || isAGroup) {
      return;
    }
    const name = await reverseResolveDomain(activeChat?.did.slice(7)!);
    if ("error" in name) {
      return;
    }
    setChatName(name.name[0] ?? trimAddress(activeChat?.did.slice(7)!));
  };

  useEffect(() => {
    fetchDomainName();
  }, [activeChat]);

  useEffect(() => {
    if (isAGroup)
      setChatName(
        activeChat?.groupInformation?.groupName || activeChat?.chatId!
      );
    else setChatName(trimAddress(activeChat?.did.slice(7)!));
  }, [activeChat]);
  return (
    <div className="rounded-md h-16 mx-2 bg-gray-600  bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-row gap-4 items-center px-4">
      <Image
        src={
          isAGroup
            ? activeChat?.groupInformation?.groupImage || DEFAULT_PFP
            : activeChat?.profilePicture || DEFAULT_PFP
        }
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col ">
        <p className="text-sm font-medium">{chatName}</p>
      </div>
    </div>
  );
};

export default ChatInfoCard;
