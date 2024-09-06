import {DEFAULT_PFP, MESSAGE_TYPE} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {convertUnixTimestampToHHMM, trimAddress} from "@/lib/utils";
import {IMessage} from "@/types";
import Image from "next/image";
import React, {useEffect, useState} from "react";

const ChatBubble = ({
  message,
  sender,
  timestamp,
  titleColor,
  messageType,
  reactions,
}: {
  message: string;
  sender: string;
  timestamp: number;
  titleColor?: string;
  messageType: string;
  reactions?: IMessage[];
}) => {
  const {account, activeChat} = useAppContext();
  const {getUserInfo, resolveDomain} = usePush();

  // only for group chats
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);
  console.log("ChatBubble", message, messageType);
  useEffect(() => {
    const getSenderImage = async () => {
      if (activeChat?.groupInformation?.chatId) {
        const senderImage = activeChat.groupInformation.members.find(
          (member) => member.wallet === sender
        )?.image;
        if (!senderImage) {
          const senderDetails = await getUserInfo({overrideAccount: sender});
          if ("error" in senderDetails) return;
          setSenderImage(senderDetails.profile.picture || DEFAULT_PFP);
        }
      }
    };
    const getSenderName = async () => {
      if (!activeChat?.groupInformation?.chatId) return;
      const name = await resolveDomain(sender.slice(7));
      if ("error" in name) return;
      setSenderName(name.name[0]);
    };

    Promise.all([getSenderImage(), getSenderName()]);
  }, [activeChat]);

  return (
    <div
      className={`flex flex-row ${
        sender.slice(7) === account ? "justify-end" : "justify-start items-end"
      }`}
    >
      {activeChat?.groupInformation?.chatId && sender.slice(7) != account && (
        <Image
          src={senderImage || DEFAULT_PFP}
          alt="avatar"
          width={20}
          height={20}
          className="rounded-full w-6 h-6 mr-2"
        />
      )}
      <div
        className={`relative flex flex-col rounded-md w-fit min-w-[12%] max-w-[60%] ${
          sender.slice(7) === account ? "bg-secondary" : "bg-secondary"
        } ${reactions && reactions.length > 0 ? "mb-4" : "mb-0"}`}
      >
        {activeChat?.groupInformation?.chatId && sender.slice(7) != account && (
          <p
            className={`px-4 pt-3 pb-0`}
            style={{
              color: titleColor,
            }}
          >
            {senderName || trimAddress(sender.slice(7))}
          </p>
        )}
        {messageType === MESSAGE_TYPE.TEXT && (
          <p
            className={`px-4 text-wrap break-words text-white/75 ${
              activeChat?.groupInformation?.chatId && sender.slice(7) != account
                ? "pt-1"
                : "pt-3"
            }`}
          >
            {message}
          </p>
        )}

        {messageType === MESSAGE_TYPE.IMAGE && (
          <Image
            src={JSON.parse(message).content}
            alt="image"
            width={100}
            height={100}
            className="rounded-md w-[400px] h-auto"
          />
        )}
        {messageType === MESSAGE_TYPE.GIF && (
          <Image
            src={message}
            alt="image"
            width={100}
            height={100}
            className="rounded-md w-[400px] h-auto"
          />
        )}
        <span
          className={`text-xs mt-1  pb-1 pr-2 text-right text-muted-foreground ${
            sender.slice(7) != account ? "" : ""
          } ${
            messageType !== MESSAGE_TYPE.TEXT
              ? "absolute bottom-0 right-0 text-muted-foreground font-medium "
              : ""
          }`}
        >
          {convertUnixTimestampToHHMM(timestamp)}
        </span>
        {reactions && reactions.length > 0 && (
          <div className="flex flex-row gap-1 bg-gray-800  px-3 py-[6px] absolute -bottom-4 left-2 w-fit rounded-full">
            {reactions?.map((reaction, i) => (
              <div key={i} className="text-xs">
                {reaction.messageContent.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
