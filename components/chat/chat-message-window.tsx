"use client";
import usePush from "@/app/hooks/usePush";
import {assignColorsToParticipants, getTimeFormatted} from "@/lib/utils";
import {usePushUser} from "@/providers/push-provider";
import React, {useEffect, useRef, useState} from "react";
import {useAccount} from "wagmi";
import {Button} from "../ui/button";

import {useRouter, useSearchParams} from "next/navigation";
import {Badge} from "../ui/badge";
import ChatLoadingSkeleton from "./chat-loading-skeleton";
import ChatMessageBubble from "./chat-message-bubble";
import FullPageLoader from "../ui/full-page-loader";

interface ChatMessagesWindowProps {
  chatId: string;
}
const ChatMessagesWindow: React.FC<ChatMessagesWindowProps> = ({chatId}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [isAGroup, setIsAGroup] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<{
    [key: string]: string;
  }>({});
  const {
    fetchAllMessages,
    fetchChatStatus,
    acceptChatRequest,
    rejectChatRequest,
  } = usePush();
  const {address} = useAccount();
  const {pushUser, latestMessage} = usePushUser();
  const makeItVisible = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isARequest = searchParams.get("request") === "true";
  const [fetchMessagesStatus, setFetchMessagesStatus] = useState({
    fetching: false,
    reference: "",
  });
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await fetchChatStatus(chatId);

      setIsAGroup(status?.meta?.group ?? false);

      setStatus(status?.list);
    };
    fetchStatus();
  }, [chatId]);
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const messages = await fetchAllMessages(chatId);

      if (!messages) return;
      setMessages(messages.reverse());
      console.log(messages);
      setLoading(false);
    };
    fetchMessages();
  }, [chatId, pushUser]);

  useEffect(() => {
    if (!latestMessage) return;
    if (latestMessage.origin === "self") return;
    if (
      chatId.startsWith("0x") &&
      latestMessage.from !== `eip155:${chatId}` &&
      !latestMessage.to.includes(`eip155:${chatId}`)
    )
      return;
    setMessages((prev) => [
      ...prev,
      {
        id: latestMessage.chatId,
        messageContent: latestMessage.message.content,
        fromDID: latestMessage.from,
        timestamp: Number(latestMessage.timestamp),
        messageType: latestMessage.message.type,
        cid: latestMessage.reference,

        messageObj: {
          content: latestMessage.message.content,
          ...(latestMessage.message.type === "Reaction" && {
            reference: latestMessage.reference,
          }),
        },
      },
    ]);

    makeItVisible.current?.scrollIntoView();
  }, [latestMessage]);

  useEffect(() => {
    const partcipants = messages.map((message) => message.fromDID.slice(7));
    const uniqueParticipants = Array.from(new Set(partcipants));
    const participantsColors = assignColorsToParticipants(uniqueParticipants);
    setGroupParticipants(participantsColors);
  }, [messages]);
  useEffect(() => {
    if (messages.length > 20) return;
    makeItVisible.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          if (fetchMessagesStatus.fetching) return;
          setFetchMessagesStatus({
            fetching: true,
            reference: messages[0].cid,
          });

          const response = await fetchAllMessages(chatId, messages[0].cid);
          if (response && response?.length > 0) {
            const oldMessages = [...response.slice(1, 20)].reverse();
            setMessages((prev) => [...oldMessages, ...prev]);
          }
          setFetchMessagesStatus({
            fetching: false,
            reference: "",
          });
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    if (firstMessageRef.current) {
      observer.observe(firstMessageRef.current);
    }

    return () => {
      if (firstMessageRef.current) {
        observer.unobserve(firstMessageRef.current);
      }
    };
  }, [firstMessageRef.current]);

  if (!pushUser) return <FullPageLoader />;
  return (
    <div className="flex flex-col flex-grow gap-2 my-2 max-h-[90%] overflow-y-auto">
      {fetchMessagesStatus.fetching && <ChatLoadingSkeleton />}
      {!loading &&
        messages?.map((message) => {
          if (message.messageType == "Reaction") {
            return;
          }

          const messageReactions = messages.filter(
            (msg) =>
              msg.messageType === "Reaction" &&
              msg.messageObj.reference === message.cid
          );

          const self = message.fromDID.slice(7) === address;
          const previousMessageTimestamp =
            messages[messages.indexOf(message) - 1]?.timestamp;
          const currentMessageTimestamp = message.timestamp;
          if (!previousMessageTimestamp) {
            return (
              <div key={message.link} className="flex flex-col w-full">
                <Badge className="bg-secondary text-white font-light text-md px-4 py-1 text-sm  w-fit m-auto my-8">
                  {new Date(currentMessageTimestamp).toLocaleDateString()}
                </Badge>

                <ChatMessageBubble
                  key={message.cid}
                  message={message.messageContent}
                  self={self}
                  timestamp={message.timestamp}
                  isGroup={isAGroup}
                  sender={message.fromDID.slice(7)}
                  color={groupParticipants[message.fromDID.slice(7)]}
                  messageReactions={messageReactions}
                  messageType={message.messageType}
                />
                <div ref={firstMessageRef}></div>
              </div>
            );
          }
          if (previousMessageTimestamp) {
            const previousMessageDate = new Date(previousMessageTimestamp);
            const currentMessageDate = new Date(currentMessageTimestamp);

            const oneDay = 24 * 60 * 60 * 1000;

            if (
              Math.abs(
                currentMessageDate.getTime() - previousMessageDate.getTime()
              ) >= oneDay
            ) {
              let displayDate = "";
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              if (currentMessageDate.toDateString() === today.toDateString()) {
                displayDate = "Today";
              } else if (
                currentMessageDate.toDateString() === yesterday.toDateString()
              ) {
                displayDate = "Yesterday";
              } else {
                displayDate = currentMessageDate.toLocaleDateString("en-GB");
              }

              return (
                <div key={message.link} className="flex flex-col w-full">
                  <Badge className="bg-secondary text-white font-light text-md px-4 py-1 text-sm  w-fit m-auto my-8">
                    {displayDate}
                  </Badge>

                  <ChatMessageBubble
                    key={message.cid}
                    message={message.messageContent}
                    self={self}
                    timestamp={message.timestamp}
                    isGroup={isAGroup}
                    sender={message.fromDID.slice(7)}
                    color={groupParticipants[message.fromDID.slice(7)]}
                    messageReactions={messageReactions}
                    messageType={message.messageType}
                  />
                </div>
              );
            }
          }
          return (
            <ChatMessageBubble
              key={message.cid}
              message={message.messageContent}
              self={self}
              timestamp={message.timestamp}
              isGroup={isAGroup}
              sender={message.fromDID.slice(7)}
              color={groupParticipants[message.fromDID.slice(7)]}
              messageType={message.messageType}
              messageReactions={messageReactions}
            />
          );
        })}

      {loading && <ChatLoadingSkeleton />}
      {isARequest && status === "REQUESTS" && (
        <div
          className={` flex flex-col bg-secondary p-3 px-4  rounded-lg w-[fit-content] max-w-[80%]`}
        >
          <div>
            You received a message from {chatId.slice(0, 7)}...
            {chatId.slice(-4)}. Accept the chat to continue.
          </div>
          <div className="flex flex-row gap-2 my-2">
            <Button
              variant={"default"}
              className="w-full"
              onClick={() => {
                acceptChatRequest(chatId);
                router.push(`/${chatId}`);
              }}
            >
              Accept
            </Button>
            <Button
              variant={"destructive"}
              className="w-full"
              onClick={() => {
                rejectChatRequest(chatId);
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
      <div ref={makeItVisible}></div>
    </div>
  );
};

export default ChatMessagesWindow;
