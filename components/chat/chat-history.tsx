import {MESSAGE_TYPE} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {IChat, IMessage} from "@/types";
import React, {useEffect, useRef, useState} from "react";
import ChatBubble from "./chat-bubble";
import {assignColorsToParticipants, convertUnixTimestamp} from "@/lib/utils";
import {Badge} from "../ui/badge";
import {Skeleton} from "../ui/skeleton";
import {FetchingMoreMessagesLoader} from "./chat-sidebar";

const ChatMessagesContainer = () => {
  const [messages, setMessages] = useState<IMessage[] | null>();
  const [loading, setLoading] = useState(false);
  const [stopPagination, setStopPagination] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<{
    [key: string]: string;
  }>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  const {chat, activeChat} = useAppContext();
  const {feedContent} = chat as IChat;
  const {getChatHistory} = usePush();

  const MESSAGES_PER_PAGE = 15;
  const SCROLL_THRESHOLD = 100;

  // to get time per day
  const showTimestampBadge = (
    currentFeedContent: any,
    currentIndex: number
  ) => {
    if (currentIndex === 0) {
      return true; // Always show badge for the first message
    }

    const currentMsg = currentFeedContent[currentIndex];
    const previousMsg = currentFeedContent[currentIndex - 1];

    const currentDate = new Date(currentMsg.timestamp);
    const previousDate = new Date(previousMsg.timestamp);

    return currentDate.toDateString() !== previousDate.toDateString();
  };

  // Simulated API call to fetch older messages
  const fetchOlderMessages = async (): Promise<IMessage[]> => {
    return new Promise(async (resolve) => {
      const olderMessages = await getChatHistory({
        chatId: activeChat?.chatId!,
        reference: messages![0].link,
      });
      if ("error" in olderMessages) {
        resolve([]);
        return;
      }
      resolve(olderMessages);
    });
  };
  useEffect(() => {
    setMessages(feedContent[activeChat?.chatId!] || null);
  }, [activeChat]);

  useEffect(() => {
    if (messages) {
      const partcipants = messages?.map((message) => message.from);
      const uniqueParticipants = Array.from(new Set(partcipants));
      const participantsColors = assignColorsToParticipants(uniqueParticipants);
      setGroupParticipants(participantsColors);
    }
  }, [messages]);

  useEffect(() => {
    if (
      scrollRef.current &&
      messages &&
      messages.length === MESSAGES_PER_PAGE
    ) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = async () => {
    if (scrollRef.current) {
      const {scrollTop, scrollHeight, clientHeight} = scrollRef.current;
      if (scrollTop === 0 && !loading && !stopPagination) {
        if (messages && messages.length % 15 !== 0) return;
        if (loading) return;
        setLoading(true);
        const oldScrollHeight = scrollHeight;

        const olderMessages: IMessage[] = await fetchOlderMessages();

        if (olderMessages.length === 0) {
          setStopPagination(true);
        } else {
          setMessages((prevMessages) => [...olderMessages, ...prevMessages!]);
        }

        setLoading(false);

        // Maintain scroll position
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const newScrollHeight = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop = newScrollHeight - oldScrollHeight;
          }
        });
      }
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="rounded-md flex-1 mx-2 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-col overflow-y-auto p-4 gap-4"
    >
      <FetchingMoreMessagesLoader
        showLoader={loading}
        text={"Fetching older messages"}
      />
      {messages &&
        messages.map((msg, i) => {
          const reactions = messages?.filter(
            (message) =>
              message.type === MESSAGE_TYPE.REACTION &&
              message.messageContent?.reference &&
              message.messageContent.reference === msg.cid
          );
          if (msg.type === MESSAGE_TYPE.REACTION) return null;
          return (
            <React.Fragment key={msg.link}>
              {showTimestampBadge(messages, i) && (
                <div className="flex w-full justify-center items-center my-4">
                  <p className="w-fit text-xs px-2 py-1 bg-transparent text-gray-400">
                    {convertUnixTimestamp(msg.timestamp)}
                  </p>
                </div>
              )}
              <div>
                <ChatBubble
                  message={msg.messageContent.content}
                  sender={msg.from}
                  timestamp={msg.timestamp}
                  titleColor={groupParticipants[msg.from]}
                  messageType={msg.type}
                  reactions={reactions}
                />
              </div>
            </React.Fragment>
          );
        })}
      {messages && messages.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center h-full">
          <p className="text-gray-400 text-md">Start a new conversation</p>
        </div>
      )}
      {!messages &&
        Array.from({length: 5}).map((_, index) => <Loader key={index} />)}
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
export default ChatMessagesContainer;
