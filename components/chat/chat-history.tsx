"use client";
import React, {useEffect, useRef, useState, useCallback, useMemo} from "react";
import {CHAT_TYPE, MESSAGE_TYPE} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {IChat, IMessage} from "@/types";
import ChatBubble from "./chat-bubble";
import {assignColorsToParticipants, convertUnixTimestamp} from "@/lib/utils";
import FetchingMoreMessagesLoader from "../loaders/fetching-messages-loaders";
import ChatHistoryLoader from "../loaders/chat-history-loader";

const ChatMessagesContainer: React.FC = () => {
  // UI State
  const [loading, setLoading] = useState(false);
  const [stopPagination, setStopPagination] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<
    Record<string, string>
  >({});
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);

  // Context
  const {chat, activeChat, activeChatTab} = useAppContext();
  const {
    feedContent,
    setRequestsContent,
    requestsContent,
    setFeedContent,
    chatHistoryLoaders,
  } = chat as IChat;
  const {getChatHistory} = usePush();

  const currentMessages = useMemo(() => {
    if (!activeChat?.chatId) return null;
    return activeChatTab === CHAT_TYPE.REQUESTS
      ? requestsContent[activeChat.chatId]
      : feedContent[activeChat.chatId];
  }, [activeChat, feedContent, requestsContent, activeChatTab]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const showTimestampBadge = useCallback(
    (messages: IMessage[], index: number) => {
      if (index === 0) return true;

      const currentDate = new Date(messages[index].timestamp);
      const previousDate = new Date(messages[index - 1].timestamp);

      return currentDate.toDateString() !== previousDate.toDateString();
    },
    []
  );

  const fetchOlderMessages = useCallback(
    async (chatId: string, link: string): Promise<IMessage[]> => {
      if (!chatId || !currentMessages || currentMessages.length === 0)
        return [];

      const olderMessages = await getChatHistory({chatId, reference: link});
      return "error" in olderMessages ? [] : olderMessages;
    },
    [getChatHistory, currentMessages]
  );

  const handleScroll = useCallback(async () => {
    if (
      !scrollRef.current ||
      loading ||
      stopPagination ||
      !activeChat?.chatId ||
      !currentMessages ||
      currentMessages.length === 0
    )
      return;

    const {scrollTop, scrollHeight, clientHeight} = scrollRef.current;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);

    if (scrollTop !== 0) return;

    setLoading(true);
    const oldScrollHeight = scrollHeight;
    const chatId = activeChat.chatId;
    const link = currentMessages[0].link;
    const olderMessages = await fetchOlderMessages(chatId, link);

    if (olderMessages.length === 0) {
      setStopPagination(true);
    } else {
      const updateContent =
        activeChatTab === CHAT_TYPE.REQUESTS
          ? setRequestsContent
          : setFeedContent;
      updateContent((prev) => ({
        ...prev,
        [chatId]: [...olderMessages, ...currentMessages],
      }));
    }

    setLoading(false);

    // Maintain scroll position
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const newScrollHeight = scrollRef.current.scrollHeight;
        scrollRef.current.scrollTop = newScrollHeight - oldScrollHeight;
      }
    });
  }, [
    loading,
    stopPagination,
    currentMessages,
    fetchOlderMessages,
    activeChat,
    setFeedContent,
    activeChatTab,
    setRequestsContent,
  ]);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [currentMessages, scrollToBottom, isNearBottom, activeChat]);

  useEffect(() => {
    if (activeChat?.isGroup && currentMessages && currentMessages.length > 0) {
      const participants = Array.from(
        new Set(currentMessages.map((message) => message.from))
      );
      const participantsColors = assignColorsToParticipants(participants);
      setGroupParticipants(participantsColors);
    }
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [currentMessages, scrollToBottom, isNearBottom, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, scrollToBottom]);

  const renderMessage = useCallback(
    (msg: IMessage, index: number, messages: IMessage[]) => {
      if (msg.type === MESSAGE_TYPE.REACTION) return null;
      const reactions = messages.filter(
        (message) =>
          message.type === MESSAGE_TYPE.REACTION &&
          message.messageContent?.reference === msg.cid
      );

      return (
        <React.Fragment key={msg.link}>
          {showTimestampBadge(messages, index) && (
            <div className="flex w-full justify-center items-center my-4">
              <p className="w-fit text-xs px-2 py-1 bg-transparent text-gray-400">
                {convertUnixTimestamp(msg.timestamp, true)}
              </p>
            </div>
          )}
          <ChatBubble
            message={msg.messageContent.content}
            sender={msg.from}
            timestamp={msg.timestamp}
            titleColor={groupParticipants[msg.from]}
            messageType={msg.type}
            reactions={reactions}
            cid={msg.cid}
          />
        </React.Fragment>
      );
    },
    [groupParticipants, showTimestampBadge]
  );

  const renderMessages = useMemo(() => {
    if (!currentMessages || currentMessages.length === 0) return null;

    return currentMessages
      .filter(
        (msg, index, self) => self.findIndex((m) => m.cid === msg.cid) === index
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((msg, index) => renderMessage(msg, index, currentMessages));
  }, [currentMessages, renderMessage]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="rounded-md flex-1 mx-2 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-col overflow-y-auto p-4 gap-4"
    >
      <FetchingMoreMessagesLoader
        showLoader={loading}
        text="Fetching older messages"
      />
      {renderMessages}
      {!chatHistoryLoaders[activeChat?.chatId!] &&
        currentMessages &&
        currentMessages.length === 0 && (
          <div className="flex flex-col gap-2 items-center justify-center h-full">
            <p className="text-gray-400 text-md">Start a new conversation</p>
          </div>
        )}
      {chatHistoryLoaders[activeChat?.chatId!] &&
        Array.from({length: 5}).map((_, index) => (
          <ChatHistoryLoader key={index} />
        ))}
    </div>
  );
};

export default ChatMessagesContainer;
