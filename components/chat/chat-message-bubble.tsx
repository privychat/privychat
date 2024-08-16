import {usePushUser} from "@/providers/push-provider";
import {IUser} from "@pushprotocol/restapi";
import {Play} from "lucide-react";
import Image from "next/image";
import React, {ReactNode, useEffect, useState} from "react";
import {useEnsName} from "wagmi";
import MessageReactionsOverlayContainer from "./message-reactions-overlay-container";
interface ChatMessageBubbleProps {
  message: string;
  self: boolean;
  timestamp: number;
  isGroup?: boolean;
  sender?: string;
  color?: string;
  messageType?: string;
  messageReactions?: any[];
}
const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  self,
  timestamp,
  isGroup,
  sender,
  color,
  messageType,
  messageReactions,
}) => {
  const {data: ensName} = useEnsName({
    address: sender as `0x${string}`,
  });
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const {pushUser} = usePushUser();
  const [user, setUser] = useState<IUser | undefined>();
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = await pushUser?.info({
        overrideAccount: sender,
      });
      setUser(user);
    };
    if (!self) fetchUserInfo();
  }, [sender]);

  return (
    <div
      className={`relative my-2 ${
        messageReactions && messageReactions?.length > 0 && "mb-4"
      } flex flex-row ${self ? "justify-end mr-2" : "justify-start ml-2"}`}
    >
      {isGroup && !self && (
        <Image
          src={
            user?.profile.picture ??
            "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
          }
          width={30}
          height={30}
          className="rounded-full w-[30px] h-[30px] m-1 mr-2"
          alt="profile"
        />
      )}
      <div
        className={`relative p-3 px-4 ${
          self ? "bg-primary" : "bg-secondary"
        } rounded-lg w-[fit-content] max-w-[50%]`}
      >
        {messageReactions && messageReactions.length > 0 && (
          <MessageReactionsOverlayContainer
            messageReactions={messageReactions!}
            self={self}
          />
        )}
        {isGroup && !self && (
          <p
            className={`font-semibold mb-1`}
            style={{
              color: `${color}`,
            }}
          >
            {ensName ??
              (user?.profile.name
                ? `~ ${user.profile.name} (${sender?.slice(
                    0,
                    6
                  )}...${sender?.slice(-4)})`
                : `${sender?.slice(0, 6)}...${sender?.slice(-4)}`)}
          </p>
        )}
        <div className="flex flex-row my-1 justify-between">
          {messageType === "Text" && (
            <div className="font-light leading-6 text-white text-wrap break-all max-w-[90%]">
              {message}
            </div>
          )}

          {messageType === "Image" && (
            <Image
              src={JSON.parse(message).content}
              width={100}
              height={100}
              alt="image"
              className="max-w-[400px] w-[400px] aspect-auto"
            />
          )}

          {message.startsWith("https://media.tenor.com") && (
            <Image
              src={message}
              alt="image"
              width={100}
              height={100}
              className="max-w-[400px] w-[400px] aspect-auto rounded-md"
            />
          )}
          <div className="relative w-20">
            <span
              className={`align-right absolute bottom-0 right-0  text-muted-foreground text-sm ${
                self && "text-white"
              }`}
            >
              {formattedTime}
            </span>
          </div>
        </div>
      </div>{" "}
    </div>
  );
};

export default ChatMessageBubble;
