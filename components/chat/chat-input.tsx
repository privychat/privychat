import React, {useEffect, useRef, useState} from "react";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {SendHorizontal} from "lucide-react";
import usePush from "@/hooks/use-push";
import {useAppContext} from "@/hooks/use-app-context";
import {CHAT_TYPE, DEFAULT_PFP, MESSAGE_TYPE, STREAM_SOURCE} from "@/constants";
import {generateRandomString} from "@/lib/utils";
import {IChat} from "@/types";

const ChatInput = () => {
  const [input, setInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {sendMessage} = usePush();
  const {activeChat, activeChatTab, chat, account} = useAppContext();
  const {setFeedContent, setFeeds, setRequests, feeds, requests} =
    chat as IChat;
  const handleSend = async () => {
    if (input.trim().length === 0) return;
    setFeedContent((prev) => {
      const currentChatHistory = prev[activeChat?.chatId!] || [];
      const randomId = generateRandomString(10); // not the right way to do it but for timebeing
      return {
        ...prev,
        [activeChat?.chatId!]: [
          ...(currentChatHistory || []),
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

    //this is to update the sidebar with latest message
    if (activeChatTab === CHAT_TYPE.REQUESTS) {
      setRequests((prev) => {
        if (!prev || !activeChat) return null;

        let chatExists = false;

        const updatedChats = prev.map((chat) => {
          if (
            chat.chatId === activeChat.chatId ||
            chat.chatId === activeChat.did
          ) {
            chatExists = true;
            return {
              ...chat,
              lastMessage: input,
              lastMessageTimestamp: new Date().getTime(),
            };
          }
          return chat;
        });

        if (!chatExists) {
          // Add a new entry if the activeChat.chatId was not found
          updatedChats.push({
            chatId: activeChat.chatId,
            did: activeChat.did,
            profilePicture: DEFAULT_PFP,
            lastMessage: input,
            lastMessageTimestamp: new Date().getTime(),
            isGroup: activeChat.isGroup,
          });
        }

        return updatedChats;
      });
    } else {
      setFeeds((prev) => {
        if (!prev || !activeChat) return null;

        let chatExists = false;

        const updatedChats = prev.map((chat) => {
          if (
            chat.chatId === activeChat.chatId ||
            chat.chatId === activeChat.did
          ) {
            chatExists = true;
            return {
              ...chat,
              lastMessage: input,
              lastMessageTimestamp: new Date().getTime(),
            };
          }
          return chat;
        });

        if (!chatExists) {
          // Add a new entry if the activeChat.chatId was not found
          updatedChats.push({
            chatId: activeChat.chatId,
            did: activeChat.did,
            profilePicture: DEFAULT_PFP,
            lastMessage: input,
            lastMessageTimestamp: new Date().getTime(),
            isGroup: activeChat.isGroup,
          });
        }

        return updatedChats;
      });
    }

    sendMessage({
      message: input,
      chatId: activeChat?.chatId!,
      type: MESSAGE_TYPE.TEXT,
    });

    setInput("");
  };

  useEffect(() => {
    if (window.innerWidth > 768) {
      inputRef.current?.focus();
    }
    setInput("");
  }, [activeChat]);

  return (
    <div
      className={`flex flex-row items-center justify-center h-14 rounded-md gap-2 p-2 pt-1 ${
        isFocused ? "mb-1" : "mb-8"
      } md:mb-1`}
    >
      <Input
        ref={inputRef}
        className="w-full h-full bg-secondary rounded-md text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
        placeholder="Type a message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        inputMode="search"
      />
      <Button
        className="bg-primary h-full p-2 px-3 cursor-pointer rounded-md"
        onClick={handleSend}
      >
        <SendHorizontal />
      </Button>
    </div>
  );
};

export default ChatInput;
