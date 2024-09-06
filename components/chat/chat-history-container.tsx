import React, {useEffect, useRef, useState} from "react";
import ChatBubble from "./chat-bubble";
import {useAppContext} from "@/hooks/use-app-context";
import {assignColorsToParticipants} from "@/lib/utils";
import {MESSAGE_TYPE} from "@/constants";

const ChatHistoryContainer = () => {
  const {chat, activeChat} = useAppContext();

  const [groupParticipants, setGroupParticipants] = useState<{
    [key: string]: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      chat &&
      chat.feedContent &&
      activeChat?.chatId &&
      chat.feedContent[activeChat?.chatId!]
    ) {
      const partcipants = chat.feedContent[activeChat?.chatId!]?.map(
        (message) => message.from
      );
      const uniqueParticipants = Array.from(new Set(partcipants));
      const participantsColors = assignColorsToParticipants(uniqueParticipants);
      setGroupParticipants(participantsColors);
    }
  }, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, []);
  return (
    <div className="rounded-md flex-1 mx-2 bg-gray-600  bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-row overflow-y-auto">
      <div className="w-full px-4 pt-4 flex flex-col gap-4 overflow-y-auto">
        {chat &&
          chat.feedContent &&
          chat.feedContent[activeChat?.chatId!]?.map((msg, i) => {
            const reactions = chat.feedContent[activeChat?.chatId!]?.filter(
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistoryContainer;
