import React, {ReactNode} from "react";
import {useEnsName} from "wagmi";
interface ChatMessageBubbleProps {
  message: string | ReactNode;
  self: boolean;
  timestamp: number;
  isGroup?: boolean;
  sender?: string;
  color?: string;
}
const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  self,
  timestamp,
  isGroup,
  sender,
  color,
}) => {
  const {data: ensName} = useEnsName({
    address: sender as `0x${string}`,
  });
  const formattedTime = new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  console.log(color);
  return (
    <div
      className={` flex flex-col ${
        self ? "items-end mr-2" : "items-start ml-2"
      }`}
    >
      <div
        className={`relative p-3 px-4 ${
          self ? "bg-primary" : "bg-secondary"
        } rounded-lg w-[fit-content] max-w-[50%]`}
      >
        {isGroup && !self && (
          <p
            className={`font-semibold mb-1 `}
            style={{
              color: `${color}`,
            }}
          >
            {ensName ?? `${sender?.slice(0, 6)}...${sender?.slice(-4)}`}
          </p>
        )}
        <div className="flex flex-row my-1">
          <p className="font-medium leading-6 text-gray-200 ">{message}</p>
          <div className="relative w-44">
            <span className="align-right absolute bottom-0 right-0  text-muted-foreground text-sm">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
