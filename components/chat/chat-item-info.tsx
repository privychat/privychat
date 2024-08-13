"use client";
import React, {useEffect, useState} from "react";
import ThemeToggleSwitch from "../ui/theme-toggle-switch";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {useEnsName} from "wagmi";
import {usePushUser} from "@/providers/push-provider";
import usePush from "@/app/hooks/usePush";
import {CameraIcon, VideoIcon} from "lucide-react";

interface ChatItemInfoProps {
  chatName: string;
}
interface IChatItemInfo {
  image?: string | null;
  chatId: string;
  chatName?: string | null;
}
const ChatItemInfo: React.FC<ChatItemInfoProps> = ({chatName}) => {
  const {pushUser} = usePushUser();
  const {fetchGroupInfo, fetchUser} = usePush();
  const [info, setInfo] = useState<IChatItemInfo>();
  const {data: ensName} = useEnsName({
    address: chatName as `0x${string}`,
  });

  const {userChats, userChatRequests} = usePushUser();
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (userChats) {
        const chatid = userChats.find(
          (chat) =>
            chat.did === `eip155:${chatName}` || chat.chatId === chatName
        );
        if (chatid) {
          setInfo({
            image:
              chatid?.groupInformation?.groupImage ?? chatid?.profilePicture,
            chatId: chatName,
            chatName:
              chatid?.groupInformation?.groupName ??
              ensName ??
              `${chatName.slice(0, 6)}...${chatName.slice(-4)}`,
          });
          return;
        }
      }
      if (userChatRequests) {
        const chatid = userChatRequests.find(
          (chat) =>
            chat.did === `eip155:${chatName}` || chat.chatId === chatName
        );

        if (chatid) {
          setInfo({
            image:
              chatid?.groupInformation?.groupImage ?? chatid?.profilePicture,
            chatId: chatName,
            chatName:
              chatid?.groupInformation?.groupName ??
              ensName ??
              `${chatName.slice(0, 6)}...${chatName.slice(-4)}`,
          });
          return;
        }
      }

      if (chatName.startsWith("0x")) {
        const userInfo = await fetchUser(chatName);

        setInfo({
          image: userInfo?.profile.picture,
          chatId: chatName,
          chatName:
            ensName ?? `${chatName.slice(0, 6)}...${chatName.slice(-4)}`,
        });
      } else {
        const chatInfo = await fetchGroupInfo(chatName);

        setInfo({
          image: chatInfo?.groupImage,
          chatId: chatName,
          chatName:
            chatInfo?.groupName ??
            `${chatName.slice(0, 6)}...${chatName.slice(-4)}`,
        });
      }
    };
    fetchChatInfo();
  }, [pushUser]);

  return (
    <div className="flex flex-row  gap-2 w-full items-center p-4 py-2 bg-gray-400/20 rounded-md">
      <Avatar className="w-[50px] h-[50px] flex items-center rounded-full">
        <AvatarImage
          src={
            info?.image ??
            "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
          }
          className="w-[40px] h-[40px] rounded-full"
        />
        <AvatarFallback>user</AvatarFallback>
      </Avatar>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight w-[60%] flex-grow">
        {info?.chatName}
      </h4>
      {/* <div>{chatName.startsWith("0x") && <VideoIcon />}</div> */}
    </div>
  );
};

export default ChatItemInfo;
