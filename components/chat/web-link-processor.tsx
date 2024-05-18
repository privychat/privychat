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
interface WebLinkProcessorProps {
  message: string;
  self: boolean;
  timestamp: number;
}
const WebLinkProcessor: React.FC<WebLinkProcessorProps> = ({
  message,
  self,
  timestamp,
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
        <div className="flex flex-col gap-2">
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
              {replaceLinks(message)}
            </div>{" "}
            <span className="mt-1  text-muted-foreground text-sm">
              {getTimeFormatted(timestamp)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default WebLinkProcessor;
