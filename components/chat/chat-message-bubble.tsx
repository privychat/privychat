import {usePushUser} from "@/providers/push-provider";
import {IUser} from "@pushprotocol/restapi";
import {Play} from "lucide-react";
import Image from "next/image";
import React, {ReactNode, useEffect, useState} from "react";
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
  const {pushUser} = usePushUser();
  const [user, setUser] = useState<IUser | undefined>();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = await pushUser?.info({
        overrideAccount: sender,
      });
      setUser(user);
    };
    fetchUserInfo();
  }, [sender]);

  return (
    <div
      className={`my-1 flex flex-row ${
        self ? "justify-end mr-2" : "justify-start ml-2"
      }`}
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
        <div className="flex flex-row my-1">
          <p className="font-light leading-6 text-white ">{message}</p>
          <div className="relative w-44">
            <span
              className={`align-right absolute bottom-0 right-0  text-muted-foreground text-sm ${
                self && "text-white"
              }`}
            >
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
