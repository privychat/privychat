import React, {useEffect, useRef, useState} from "react";
import ChatBubble from "./chat-bubble";
import {useAppContext} from "@/hooks/use-app-context";
import {assignColorsToParticipants} from "@/lib/utils";
import {MESSAGE_TYPE} from "@/constants";
import {IChat} from "@/types";
import {Skeleton} from "../ui/skeleton";

const ChatHistoryContainer = () => {
  const {chat, activeChat} = useAppContext();
  const {feedContent} = chat as IChat;

  const [groupParticipants, setGroupParticipants] = useState<{
    [key: string]: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      chat &&
      feedContent &&
      activeChat?.chatId &&
      feedContent[activeChat?.chatId!]
    ) {
      const partcipants = feedContent[activeChat?.chatId!]?.map(
        (message) => message.from
      );
      const uniqueParticipants = Array.from(new Set(partcipants));
      const participantsColors = assignColorsToParticipants(uniqueParticipants);
      setGroupParticipants(participantsColors);
    }
  }, [feedContent, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "auto"});
  }, [activeChat, feedContent]);
  return (
    <div className="rounded-md flex-1 mx-2 bg-gray-600  bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-row overflow-y-auto">
      <div className="w-full px-4 pt-4 flex flex-col gap-4 overflow-y-auto">
        {chat &&
          feedContent &&
          feedContent[activeChat?.chatId!]?.map((msg, i) => {
            const reactions = feedContent[activeChat?.chatId!]?.filter(
              (message) =>
                message.type === MESSAGE_TYPE.REACTION &&
                message.messageContent?.reference &&
                message.messageContent.reference === msg.cid
            );
            if (msg.type === MESSAGE_TYPE.REACTION) return;
            return (
              <ChatBubble
                key={i}
                message={msg.messageContent.content}
                sender={msg.from}
                timestamp={msg.timestamp}
                titleColor={groupParticipants[msg.from]}
                messageType={msg.type}
                reactions={reactions}
              />
            );
          })}

        {chat &&
          feedContent[activeChat?.chatId!] &&
          feedContent[activeChat?.chatId!]?.length === 0 && (
            <div className="flex flex-col gap-2 items-center justify-center h-full">
              <p className="text-gray-400 text-md">Start a new conversation</p>
            </div>
          )}

        {chat &&
          feedContent &&
          !feedContent[activeChat?.chatId!] &&
          Array.from({length: 5}).map((_, index) => <Loader key={index} />)}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

const Loader = () => {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="w-full flex justify-start">
        <Skeleton className="rounded-md w-[40%] h-10 bg-gray-800" />
      </div>
      <div className="w-full flex justify-end">
        <Skeleton className="rounded-md w-[40%] h-10 bg-gray-800" />
      </div>
    </div>
  );
};
export default ChatHistoryContainer;
