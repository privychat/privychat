import React, {useEffect, useRef, useState, useCallback} from "react";
import {MESSAGE_TYPE} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {IChat, IMessage} from "@/types";
import ChatBubble from "./chat-bubble";
import {assignColorsToParticipants, convertUnixTimestamp} from "@/lib/utils";
import FetchingMoreMessagesLoader from "../loaders/fetching-messages-loaders";
import ChatHistoryLoader from "../loaders/chat-history-loader";

const MESSAGES_PER_PAGE = 15;

const ChatMessagesContainer: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopPagination, setStopPagination] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<{
    [key: string]: string;
  }>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const {chat, activeChat, streamMessage} = useAppContext();
  const {feedContent, setFeedContent} = chat as IChat;
  const {getChatHistory} = usePush();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const showTimestampBadge = (
    currentFeedContent: IMessage[],
    currentIndex: number
  ) => {
    if (currentIndex === 0) return true;

    const currentMsg = currentFeedContent[currentIndex];
    const previousMsg = currentFeedContent[currentIndex - 1];

    const currentDate = new Date(currentMsg.timestamp);
    const previousDate = new Date(previousMsg.timestamp);

    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const fetchOlderMessages = useCallback(async (): Promise<IMessage[]> => {
    if (!activeChat?.chatId || !messages || messages.length === 0) return [];

    const olderMessages = await getChatHistory({
      chatId: activeChat.chatId,
      reference: messages[0].link,
    });

    return "error" in olderMessages ? [] : olderMessages;
  }, [activeChat, messages, getChatHistory]);

  const handleScroll = useCallback(async () => {
    if (!scrollRef.current || loading || stopPagination) return;

    const {scrollTop, scrollHeight, clientHeight} = scrollRef.current;
    if (
      scrollTop !== 0 ||
      !messages ||
      messages.length % MESSAGES_PER_PAGE !== 0
    )
      return;

    setLoading(true);
    const oldScrollHeight = scrollHeight;

    const olderMessages = await fetchOlderMessages();

    if (olderMessages.length === 0) {
      setStopPagination(true);
    } else {
      setMessages((prevMessages) => [
        ...olderMessages,
        ...(prevMessages || []),
      ]);
      setFeedContent((prevFeedContent) => ({
        ...prevFeedContent,
        [activeChat?.chatId!]: [
          ...olderMessages,
          ...(prevFeedContent[activeChat?.chatId!] || []),
        ],
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
    messages,
    fetchOlderMessages,
    activeChat,
    setFeedContent,
  ]);

  useEffect(() => {
    if (!messages) setMessages(feedContent[activeChat?.chatId!] || null);
  }, [feedContent, activeChat, messages]);

  useEffect(() => {
    setMessages(feedContent[activeChat?.chatId!] || null);
    scrollToBottom();
  }, [activeChat, feedContent[activeChat?.chatId!], scrollToBottom]);

  useEffect(() => {
    if (messages) {
      const participants = messages.map((message) => message.from);
      const uniqueParticipants = Array.from(new Set(participants));
      const participantsColors = assignColorsToParticipants(uniqueParticipants);
      setGroupParticipants(participantsColors);
    }
    if (messages && messages.length === MESSAGES_PER_PAGE) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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
      {messages &&
        messages.map((msg, i) => {
          if (msg.type === MESSAGE_TYPE.REACTION) return null;
          const reactions = messages.filter(
            (message) =>
              message.type === MESSAGE_TYPE.REACTION &&
              message.messageContent?.reference === msg.cid
          );
          return (
            <React.Fragment key={msg.link}>
              {showTimestampBadge(messages, i) && (
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
              />
            </React.Fragment>
          );
        })}
      {messages && messages.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">Start a new conversation</p>
        </div>
      )}
      {!messages &&
        Array.from({length: 5}).map((_, index) => (
          <ChatHistoryLoader key={index} />
        ))}
    </div>
  );
};

export default ChatMessagesContainer;
