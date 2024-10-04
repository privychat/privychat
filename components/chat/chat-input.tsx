import React, {useEffect, useRef, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "../ui/button";
import {SendHorizontal, Smile} from "lucide-react";
import usePush from "@/hooks/use-push";
import {useAppContext} from "@/hooks/use-app-context";
import {CHAT_TYPE, DEFAULT_PFP, MESSAGE_TYPE, STREAM_SOURCE} from "@/constants";
import {generateRandomString} from "@/lib/utils";
import {IChat} from "@/types";
import EmojiPicker, {Theme} from "emoji-picker-react";

const ChatInput = () => {
  const [input, setInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {sendMessage} = usePush();
  const {activeChat, activeChatTab, chat, account} = useAppContext();
  const {setFeedContent, setFeeds, setRequests} = chat as IChat;
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
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const lineCount = input.split("\n").length;
      const lineHeight = 24;
      const padding = 16;
      const maxHeight = 8 * 16;
      const newHeight = Math.min(lineCount * lineHeight + padding, maxHeight);
      inputRef.current.style.height = `${Math.max(40, newHeight)}px`;
      inputRef.current.style.borderRadius = `${newHeight > 40 ? 20 : 100}px`;
    }
  }, [input]);
  return (
    <div
      className={`relative flex flex-row bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 items-end justify-center min-h-12 max-h-[576px] mx-2 p-2 mt-1 rounded-md gap-2 ${
        isFocused ? "mb-1" : "mb-8"
      } md:mb-1`}
    >
      <div className="h-10 rounded-md flex items-center justify-center">
        <Smile
          className="text-white/50 cursor-pointer mx-1"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
      </div>

      <div className="absolute bottom-full mb-2 left-2">
        <EmojiPicker
          theme={Theme.DARK}
          skinTonesDisabled={true}
          onEmojiClick={(e, emoji) => {
            setInput((prev) => prev + e.emoji);
          }}
          open={showEmojiPicker}
        />
      </div>

      <Textarea
        ref={inputRef}
        className="w-full min-h-10 max-h-32 pl-4 bg-secondary text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none resize-none overflow-y-auto"
        placeholder="Type a message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        inputMode="search"
      />
      <Button
        className="bg-primary h-10 p-2 cursor-pointer rounded-full"
        onClick={handleSend}
      >
        <SendHorizontal />
      </Button>
    </div>
  );
};

export default ChatInput;
