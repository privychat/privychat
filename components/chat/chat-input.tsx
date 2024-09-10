import React, {useState} from "react";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {Send} from "lucide-react";
import usePush from "@/hooks/use-push";
import {useAppContext} from "@/hooks/use-app-context";
import {MESSAGE_TYPE, STREAM_SOURCE} from "@/constants";
import {generateRandomString} from "@/lib/utils";
import {IChat} from "@/types";

const ChatInput = () => {
  const [input, setInput] = useState<string>("");
  const {sendMessage} = usePush();
  const {activeChat, setStreamMessage, chat, account} = useAppContext();
  const {setFeedContent} = chat as IChat;
  const handleSend = async () => {
    if (input.trim().length === 0) return;
    setFeedContent((prev) => {
      const currentChatHistory = prev[activeChat?.chatId!] || [];
      const randomId = generateRandomString(10); // not the right way to do it but for timebeing
      return {
        ...prev,
        [activeChat?.chatId!]: [
          ...currentChatHistory,
          {
            cid: randomId,
            from: `eip155:${account}`,
            to: activeChat?.chatId!,
            timestamp: new Date().getTime(),
            messageContent: {
              content: input,
            },
            link: randomId,
            type: MESSAGE_TYPE.TEXT,
          },
        ],
      };
    });
    setStreamMessage({
      origin: STREAM_SOURCE.SELF,
      chatId: activeChat?.chatId!,
      message: {
        content: input,
        type: MESSAGE_TYPE.TEXT,
      },
      from: `eip155:${localStorage.getItem("userAccount")}`,
      to: [
        activeChat?.groupInformation?.chatId!
          ? activeChat?.groupInformation?.chatId!
          : activeChat?.did!,
      ],
      timestamp: new Date().getTime(),
    });

    sendMessage({
      message: input,
      chatId: activeChat?.chatId!,
      type: MESSAGE_TYPE.TEXT,
    });

    setInput("");
  };

  return (
    <div className="flex flex-row items-center justify-center h-14 rounded-md p-2 pt-1">
      <Input
        className="w-full h-full bg-secondary rounded-full rounded-r-none text-sm"
        placeholder="Type a message"
        autoFocus={true}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />
      <Button
        className="bg-primary h-full cursor-pointer rounded-full rounded-l-none"
        onClick={handleSend}
      >
        <Send />
      </Button>
    </div>
  );
};

export default ChatInput;
