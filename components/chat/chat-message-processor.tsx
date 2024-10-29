import React, {useEffect, useState, useCallback, useMemo} from "react";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {extractWebLinks, trimAddress} from "@/lib/utils";
import {IChat, IMessage} from "@/types";
import {Skeleton} from "../ui/skeleton";

const ChatMessageProcessor = React.memo(
  ({
    message,
    replyReference,
  }: {
    message: string | object;
    replyReference?: string;
  }) => {
    const {account, contactBook, chat, activeChat} = useAppContext();
    const {feedContent} = chat as IChat;
    const {getMessageInfo} = usePush();
    const [parsedMessage, setParsedMessage] = useState<React.ReactNode[]>([]);
    const [messageReplied, setMessageReplied] = useState<
      IMessage | undefined
    >();
    const [weblinks, setWeblinks] = useState<string[]>([]);
    const [ogData, setOgData] = useState<{
      title: string;
      description: string;
      image: string;
      url: string;
    }>();

    const parseMessage = useCallback((msg: string | object) => {
      if (typeof msg !== "string") {
        // Handle non-string message types here
        return [JSON.stringify(msg)];
      }

      const links = extractWebLinks(msg);
      setWeblinks(links);

      const parts = msg.split(/(https?:\/\/[^\s]+)/g);
      return parts.map((part, index) => {
        if (links.includes(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-wrap break-words whitespace-pre-wrap text-sm"
            >
              {part}
            </a>
          );
        }
        return part;
      });
    }, []);

    useEffect(() => {
      setParsedMessage(parseMessage(message));
    }, [message, parseMessage]);

    const fetchOGData = useCallback(async (url: string) => {
      const response = await fetch(`/api/og?url=${url}`);
      const data = await response.json();
      setOgData({
        title: data.ogTitle,
        description: data.ogDescription,
        image: data.ogImage,
        url: data.ogUrl,
      });
    }, []);

    useEffect(() => {
      if (weblinks.length > 0) {
        fetchOGData(weblinks[0]);
      }
    }, [weblinks, fetchOGData]);

    const getReplyMessageInfo = useCallback(async () => {
      if (!replyReference || messageReplied) return;

      const existingMessage = feedContent[activeChat?.chatId!]?.find(
        (msg) => msg.cid === replyReference
      );

      if (existingMessage) {
        setMessageReplied(existingMessage);
      } else {
        const msg = await getMessageInfo(
          replyReference,
          activeChat?.did!.slice(7)!
        );

        const message = {
          cid: msg.cid,
          to: msg.toDID,
          from: msg.fromDID,
          type: msg.messageType,
          messageContent: {
            content: msg.messageContent,
            ...(msg.messageObj?.reference && {
              reference: msg.messageObj.reference,
            }),
          },
          timestamp: msg.timestamp,
          link: msg.link,
        };
        setMessageReplied(message);
      }
    }, [
      replyReference,
      messageReplied,
      feedContent,
      activeChat,
      getMessageInfo,
    ]);

    useEffect(() => {
      getReplyMessageInfo();
    }, [getReplyMessageInfo]);

    const renderedReplyMessage = useMemo(() => {
      if (!replyReference) return null;
      if (!messageReplied)
        return (
          <div className="flex-1 flex flex-col gap-1 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 rounded-md border-l-4 border-primary p-2">
            <Skeleton className={"w-12 h-2"} />
            <Skeleton className={"w-10 h-2"} />
          </div>
        );

      return (
        <div className="flex-1 flex flex-col gap-1 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 rounded-md border-l-4 border-primary p-2">
          <p className="text-sm">
            {(messageReplied.from.slice(7).toLowerCase() ===
            account?.toLowerCase()
              ? "You"
              : contactBook[messageReplied.from.slice(7) || ""]) ||
              trimAddress(messageReplied.from.slice(7) || "")}
          </p>
          <p className="text-xs text-muted-foreground">
            {messageReplied.messageContent.content}
          </p>
        </div>
      );
    }, [replyReference, messageReplied, account, contactBook]);

    const renderedOGData = useMemo(() => {
      if (!ogData?.image || !ogData.title || !ogData.description) return null;

      return (
        <div
          className="flex flex-col gap-2 mb-2 pb-2 mr-2 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 rounded-md cursor-pointer"
          onClick={() =>
            window.open(ogData.url, "_blank", "noopener,noreferrer")
          }
        >
          <img
            src={ogData.image}
            alt={ogData.title}
            className="rounded-md w-full h-auto max-h-[250px] object-cover"
          />
          <h3 className="px-3 text-xs pt-1">{ogData.title}</h3>
          <p className="px-3 text-xs text-muted-foreground">
            {ogData.description.slice(0, 100)}
          </p>
        </div>
      );
    }, [ogData]);

    return (
      <>
        {renderedReplyMessage}
        <div className="w-full p-2 pb-0.5">
          {renderedOGData}
          <div className="text-wrap break-words text-white/75 whitespace-pre-wrap text-sm w-full overflow-hidden pr-3">
            {parsedMessage}
          </div>
        </div>
      </>
    );
  }
);

ChatMessageProcessor.displayName = "ChatMessageProcessor";

export default ChatMessageProcessor;
