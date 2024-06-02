import usePush from "@/app/hooks/usePush";
import {getTimeFormatted} from "@/lib/utils";
import {usePushUser} from "@/providers/push-provider";
import React, {useEffect, useRef, useState} from "react";
import {useAccount} from "wagmi";
import {Button} from "../ui/button";
import {Skeleton} from "../ui/skeleton";
import MessagePreProcessor from "./message-preprocessor";
interface ChatMessagesWindowProps {
  chatId: string;
}
const ChatMessagesWindow: React.FC<ChatMessagesWindowProps> = ({chatId}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<any>();
  const [loading, setLoading] = useState(false);
  const {
    fetchAllMessages,
    fetchChatStatus,
    acceptChatRequest,
    rejectChatRequest,
  } = usePush();
  const {address} = useAccount();
  const {pushUser, latestMessage} = usePushUser();
  const makeItVisible = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await fetchChatStatus(chatId);
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
      },
    ]);
  }, [latestMessage]);

  useEffect(() => {
    makeItVisible.current?.scrollIntoView();
  }, [messages]);
  return (
    <div className="flex flex-col flex-grow gap-2 my-2 max-h-[90%] overflow-y-auto">
      {!loading &&
        messages?.map((message) => {
          const self = message.fromDID.slice(7) === address;

          return (
            <MessagePreProcessor
              key={message.link}
              message={message.messageContent}
              self={self}
              timestamp={message.timestamp}
            />
          );
        })}

      {loading && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end space-y-2 my-2 mr-2">
            <div className="space-y-2">
              <Skeleton className="h-10 w-[250px] rounded-md" />
            </div>
          </div>
          <div className="flex justify-start space-y-2 my-2 ml-2">
            <div className="space-y-2">
              <Skeleton className="h-10 w-[250px] rounded-md" />
            </div>
          </div>
          <div className="flex justify-end space-y-2 my-2 mr-2">
            <div className="space-y-2">
              <Skeleton className="h-10 w-[250px] rounded-md" />
            </div>
          </div>
        </div>
      )}
      {status === "REQUESTS" && (
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
