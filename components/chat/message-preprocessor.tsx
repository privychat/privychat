import {containsLink, getTimeFormatted} from "@/lib/utils";
import React from "react";
import WebLinkProcessor from "./web-link-processor";
import {useEnsName} from "wagmi";
import ChatMessageBubble from "./chat-message-bubble";
interface MessagerPreProcessorProps {
  message: string;
  timestamp: number;
  self: boolean;
  isGroup?: boolean;
  sender?: string;
  color?: string;
}
const MessagePreProcessor: React.FC<MessagerPreProcessorProps> = ({
  message,
  self,
  timestamp,
  isGroup,
  sender,
  color,
}) => {
  return (
    <>
      {containsLink(message) ? (
        <WebLinkProcessor
          message={message}
          self={self}
          timestamp={timestamp}
          isGroup={isGroup}
          sender={sender}
          color={color}
        />
      ) : (
        <ChatMessageBubble
          message={message}
          self={self}
          timestamp={timestamp}
          isGroup={isGroup}
          sender={sender}
          color={color}
        />
      )}
    </>
  );
};

export default MessagePreProcessor;
