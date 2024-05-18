import {containsLink, getTimeFormatted} from "@/lib/utils";
import React from "react";
import WebLinkProcessor from "./web-link-processor";
interface MessagerPreProcessorProps {
  message: string;
  timestamp: number;
  self: boolean;
}
const MessagePreProcessor: React.FC<MessagerPreProcessorProps> = ({
  message,
  self,
  timestamp,
}) => {
  return (
    <>
      {containsLink(message) ? (
        <WebLinkProcessor message={message} self={self} timestamp={timestamp} />
      ) : (
        <div
          className={` flex flex-col ${
            self ? "items-end mr-2" : "items-start ml-2"
          }`}
        >
          <div
            className={` p-3 px-4 ${
              self ? "bg-primary" : "bg-secondary"
            } rounded-lg w-[fit-content] max-w-[80%]`}
          >
            {message}
          </div>{" "}
          <span className="mt-1  text-muted-foreground text-sm">
            {getTimeFormatted(timestamp)}
          </span>
        </div>
      )}
    </>
  );
};

export default MessagePreProcessor;
