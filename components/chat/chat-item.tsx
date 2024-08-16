import React from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getTimeFormatted} from "@/lib/utils";
import {useEnsName} from "wagmi";
import Link from "next/link";
import {usePushUser} from "@/providers/push-provider";
interface ChatItemProps {
  chatName: string;
  chatMessage: string;
  chatTimeStamp?: number;
  chatIcon?: string | null;
  active?: boolean;
  isItARequest?: boolean;
  groupName?: string;
}
const ChatItem: React.FC<ChatItemProps> = ({
  chatMessage,
  chatTimeStamp = Date.now(),
  chatName,
  chatIcon,
  active,
  isItARequest,
  groupName,
}) => {
  const {latestMessage} = usePushUser();
  const {data: ensName} = useEnsName({
    address: chatName as `0x${string}`,
  });

  return (
    <Link
      href={
        isItARequest ? `/chat/${chatName}?request=true` : `/chat/${chatName}`
      }
    >
      <div
        className={`flex flex-row justify-evenly relative border my-1  gap-2 w-full p-3 px-2  hover:bg-gray-400/30 rounded-md ${
          active && "bg-gray-400/30"
        }`}
      >
        <Avatar className="w-[50px] h-[50px]">
          <AvatarImage src={chatIcon ?? ""} />
          <AvatarFallback>
            {" "}
            {groupName ??
              ensName ??
              `${chatName.slice(0, 6)}...${chatName.slice(-4)}`}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-grow w-[60%]">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {groupName ??
              ensName ??
              `${chatName.slice(0, 6)}...${chatName.slice(-4)}`}
          </h4>
          <p className="truncate overflow-hidden text-nowrap text-muted-foreground">
            {latestMessage?.from === `eip155:${chatName}` ||
            (latestMessage?.to.includes(`eip155:${chatName}`) &&
              latestMessage.message.type !== "Reaction")
              ? latestMessage?.message?.content
              : chatMessage}
          </p>
        </div>

        <p className="absolute right-4 top-4 text-xs font-light">
          {latestMessage?.from === `eip155:${chatName}` ||
          latestMessage?.to.includes(`eip155:${chatName}`)
            ? getTimeFormatted(Number(latestMessage.timestamp))
            : getTimeFormatted(chatTimeStamp)}
        </p>
      </div>
    </Link>
  );
};

export default ChatItem;
