import {extractWebLinks} from "@/lib/utils";
import Image from "next/image";
import React, {useEffect, useState} from "react";

const ChatMessageProcessor = ({message}: {message: string}) => {
  const [parsedMessage, setParsedMessage] = useState<React.ReactNode[]>([]);
  const [weblinks, setWeblinks] = useState<string[]>([]);
  const [ogData, setOgData] = useState<{
    title: string;
    description: string;
    image: string;
    url: string;
  }>();

  useEffect(() => {
    const links = extractWebLinks(message);
    setWeblinks(links);

    const parts = message.split(/(https?:\/\/[^\s]+)/g);
    const parsedParts = parts.map((part, index) => {
      if (links.includes(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-wrap break-words whitespace-pre-wrap text-xs"
          >
            {part}
          </a>
        );
      }
      return part;
    });
    setParsedMessage(parsedParts);
  }, [message]);

  useEffect(() => {
    const fetchOGData = async () => {
      if (weblinks.length === 0) return;
      const response = await fetch(`/api/og?url=${weblinks[0]}`);
      const data = await response.json();
      setOgData({
        title: data.ogTitle,
        description: data.ogDescription,
        image: data.ogImage,
        url: data.ogUrl,
      });
    };
    fetchOGData();
  }, [weblinks]);

  return (
    <div className="w-full">
      {ogData?.image && ogData.title && ogData.description && (
        <div
          className="flex flex-col gap-2 mb-2 pb-2 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 rounded-md cursor-pointer"
          onClick={() => {
            window.open(ogData.url, "_blank", "noopener,noreferrer");
          }}
        >
          <img
            src={ogData.image}
            alt={ogData.title}
            className="rounded-md w-full h-auto max-h-[250px] object-cover"
          />

          <h3 className="px-3 text-xs pt-1">{ogData?.title}</h3>

          <p className="px-3 text-xs text-muted-foreground">
            {ogData?.description.slice(0, 100)}
          </p>
        </div>
      )}

      <div className=" px-3 pt-3 text-wrap break-words text-white/75 whitespace-pre-wrap text-xs w-full overflow-hidden">
        {parsedMessage}
      </div>
    </div>
  );
};

export default ChatMessageProcessor;
