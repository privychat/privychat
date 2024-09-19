import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {trimAddress} from "@/lib/utils";
import {ChevronLeft} from "lucide-react";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import NewContactButton from "../contact-book/new-contact-button";

const ChatInfoCard = ({closeSheet}: {closeSheet?: () => void}) => {
  const {activeChat, contactBook} = useAppContext();
  const {reverseResolveDomain} = usePush();
  const [chatName, setChatName] = useState<string>();
  // const fetchDomainName = async () => {
  //   if (!activeChat?.did || activeChat?.isGroup) {
  //     return;
  //   }

  //   const name = await reverseResolveDomain(activeChat?.did.slice(7)!);
  //   if ("error" in name) {
  //     return;
  //   }
  //   setChatName(name.name[0] ?? trimAddress(activeChat?.did.slice(7)!));
  // };

  // useEffect(() => {
  //   fetchDomainName();
  // }, [activeChat]);

  useEffect(() => {
    if (activeChat && activeChat?.did?.slice(7) in contactBook) {
      setChatName(contactBook[activeChat.did.slice(7)]);
      return;
    } else if (activeChat?.isGroup)
      setChatName(activeChat?.groupName || activeChat?.chatId!);
    else setChatName(trimAddress(activeChat?.did.slice(7)!));
  }, [activeChat, contactBook]);
  return (
    <div className="flex flex-row gap-2 items-center h-14 mx-2 rounded-md p-2 mt-1 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20">
      {closeSheet && (
        <span className={`md:hidden cursor-pointer`} onClick={closeSheet}>
          <ChevronLeft color="white" size={30} className="p-0" />
        </span>
      )}
      <Image
        src={activeChat!.profilePicture}
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-10 h-10"
      />
      <p className="text-sm font-medium text-ellipsis text-nowrap overflow-hidden">
        {chatName}
      </p>
      {!activeChat?.isGroup &&
        activeChat &&
        !(activeChat?.did!.slice(7) in contactBook) && (
          <NewContactButton inputAddress={activeChat?.did!.slice(7)} chat />
        )}
    </div>
  );
};

export default ChatInfoCard;
