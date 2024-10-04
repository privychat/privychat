import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {trimAddress} from "@/lib/utils";
import {ChevronLeft, PinIcon, PinOff} from "lucide-react";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import NewContactButton from "../contact-book/new-contact-button";
import {Button} from "../ui/button";
import {IChat} from "@/types";
import {useToast} from "@/hooks/use-toast";

const ChatInfoCard = ({closeSheet}: {closeSheet?: () => void}) => {
  const {activeChat, contactBook, chat} = useAppContext();
  const {pinnedChats, setPinnedChats} = chat as IChat;
  const {reverseResolveDomain, pinChat, removePinChat} = usePush();
  const {toast} = useToast();
  const [chatName, setChatName] = useState<string>();

  const pinChatHandler = async () => {
    const pinnedChats = await pinChat(activeChat?.chatId!);
    if (pinnedChats.success) {
      setPinnedChats(pinnedChats.user.pinnedChats);
      toast({
        title: "Chat pinned successfully",
      });
    } else {
      toast({
        title: "Chat pinning failed",
        variant: "destructive",
      });
    }
  };
  const removePinChatHandler = async () => {
    const pinnedChats = await removePinChat(activeChat?.chatId!);
    if (pinnedChats.success) {
      setPinnedChats(pinnedChats.user.pinnedChats);

      toast({
        title: "Chat unpinned successfully",
      });
    } else {
      toast({
        title: "Chat unpinning failed",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchDomainName = async () => {
      const name = await reverseResolveDomain(activeChat?.did.slice(7)!);
      if ("error" in name) {
        setChatName(trimAddress(activeChat?.did.slice(7)!));
        return;
      }
      setChatName(name.name[0] ?? trimAddress(activeChat?.did.slice(7)!));
    };
    if (activeChat && activeChat?.did?.slice(7) in contactBook) {
      setChatName(contactBook[activeChat.did.slice(7)]);
      return;
    } else if (activeChat?.isGroup)
      setChatName(activeChat?.groupName || activeChat?.chatId!);
    else fetchDomainName();
  }, [activeChat, contactBook, reverseResolveDomain]);
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
      {activeChat?.chatId && !pinnedChats.includes(activeChat.chatId) && (
        <Button
          className="flex ml-auto bg-transparent font-light"
          variant={"outline"}
          onClick={pinChatHandler}
        >
          <PinIcon size={"16px"} className="mr-2 text-primary" /> Pin Chat
        </Button>
      )}

      {activeChat?.chatId && pinnedChats.includes(activeChat.chatId) && (
        <Button
          className="flex ml-auto bg-transparent font-light"
          variant={"outline"}
          onClick={removePinChatHandler}
        >
          <PinOff size={"16px"} className="mr-2 text-primary" /> Unpin
        </Button>
      )}
    </div>
  );
};

export default ChatInfoCard;
