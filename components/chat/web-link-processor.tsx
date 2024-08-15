"use client";

import {
  extractLinks,
  getFrameMetadata,
  getTimeFormatted,
  replaceLinks,
} from "@/lib/utils";
import React, {useEffect, useState} from "react";
import FrameRenderer from "../frame-renderer";
import {FrameDetails} from "@/app/types";
import {Chat} from "@pushprotocol/restapi/src/lib/pushapi/chat";
import ChatMessageBubble from "./chat-message-bubble";
interface WebLinkProcessorProps {
  message: string;
  self: boolean;
  timestamp: number;
  isGroup?: boolean;
  sender?: string;
  color?: string;
}
const WebLinkProcessor: React.FC<WebLinkProcessorProps> = ({
  message,
  self,
  timestamp,
  isGroup,
  sender,
  color,
}) => {
  const [frameDetails, setFrameDetails] = useState<FrameDetails | null>(null);
  const parseMessage = async () => {
    const link = extractLinks(message)[0];
    const {isValidFrame, frameType, frameDetails} = await getFrameMetadata(
      link
    );

    if (isValidFrame && frameDetails) {
      setFrameDetails(frameDetails);
    }
  };
  useEffect(() => {
    parseMessage();
  }, []);
  return (
    <>
      {frameDetails ? (
        <FrameRenderer
          frameDetails={frameDetails}
          messageMeta={{
            message,
            self,
            timestamp,
          }}
        />
      ) : (
        <ChatMessageBubble
          message={replaceLinks(message)}
          self={self}
          timestamp={timestamp}
          sender={sender}
          isGroup={isGroup}
          color={color}
        />
      )}
    </>
  );
};

export default WebLinkProcessor;
