import {DEFAULT_PFP, MESSAGE_TYPE} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {convertUnixTimestampToHHMM, trimAddress} from "@/lib/utils";
import {IMessage} from "@/types";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const ChatBubble = ({
  message,
  sender,
  timestamp,
  titleColor,
  messageType,
  reactions,
}: {
  message: string;
  sender: string;
  timestamp: number;
  titleColor?: string;
  messageType: string;
  reactions?: IMessage[];
}) => {
  const {account, activeChat} = useAppContext();
  const {getUserInfo, resolveDomain} = usePush();
  const isSelfMessage = sender.slice(7) === account;
  // only for group chats
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);
  useEffect(() => {
    const getSenderImage = async () => {
      if (activeChat?.groupInformation?.chatId) {
        const senderImage = activeChat.groupInformation.members.find(
          (member) => member.wallet === sender
        )?.image;
        if (!senderImage) {
          const senderDetails = await getUserInfo({overrideAccount: sender});
          if ("error" in senderDetails) return;
          setSenderImage(senderDetails.profile.picture || DEFAULT_PFP);
        }
      }
    };
    const getSenderName = async () => {
      if (!activeChat?.groupInformation?.chatId) return;
      const name = await resolveDomain(sender.slice(7));
      if ("error" in name) return;
      setSenderName(name.name[0]);
    };

    Promise.all([getSenderImage(), getSenderName()]);
  }, [activeChat]);

  return (
    <div
      className={`flex flex-row ${
        isSelfMessage ? "justify-end" : "justify-start items-end"
      }`}
    >
      {activeChat?.groupInformation?.chatId && !isSelfMessage && (
        <Image
          src={senderImage || DEFAULT_PFP}
          alt="avatar"
          width={20}
          height={20}
          className={`rounded-full w-6 h-6 mr-2 ${
            reactions && reactions.length > 0 ? "-translate-y-4" : ""
          }`}
        />
      )}
      <div
        className={`relative flex flex-col rounded-md w-fit min-w-[20%] max-w-[60%] ${
          isSelfMessage ? "bg-secondary" : "bg-secondary"
        } ${reactions && reactions.length > 0 ? "mb-4" : "mb-0"}`}
      >
        {activeChat?.groupInformation?.chatId && !isSelfMessage && (
          <p
            className={`px-4 pt-3 pb-0`}
            style={{
              color: titleColor,
            }}
          >
            {senderName || trimAddress(sender.slice(7))}
          </p>
        )}
        {messageType === MESSAGE_TYPE.TEXT && (
          <p
            className={`px-4 pt-3 text-wrap break-words text-white/75 whitespace-pre-wrap`}
          >
            {message}
          </p>
        )}

        {messageType === MESSAGE_TYPE.IMAGE && (
          <Image
            src={JSON.parse(message).content}
            alt="image"
            width={100}
            height={100}
            className="rounded-md w-[400px] h-auto pt-2"
          />
        )}
        {messageType === MESSAGE_TYPE.GIF && (
          <Image
            src={message}
            alt="image"
            width={100}
            height={100}
            className="rounded-md w-[400px] h-auto pt-2"
          />
        )}
        <span
          className={`text-xs mt-1  pb-1 pr-2 text-right text-muted-foreground ${
            !isSelfMessage ? "" : ""
          } ${
            messageType !== MESSAGE_TYPE.TEXT
              ? "absolute bottom-0 right-0 text-muted-foreground font-medium "
              : ""
          }`}
        >
          {convertUnixTimestampToHHMM(timestamp)}
        </span>

        {reactions && reactions.length > 0 && (
          <div className="absolute -bottom-4 left-2">
            <Popover>
              <PopoverTrigger className="flex flex-row bg-gray-800  px-3 py-[6px]  w-fit rounded-full gap-2">
                {reactions
                  ?.reduce((uniqueReactions: IMessage[], reaction) => {
                    if (
                      !uniqueReactions.some(
                        (r) =>
                          r.messageContent.content ===
                          reaction.messageContent.content
                      )
                    ) {
                      uniqueReactions.push(reaction);
                    }
                    return uniqueReactions;
                  }, [])
                  ?.slice(0, 2)
                  ?.map((reaction, i) => (
                    <div key={i} className="text-xs">
                      {reaction.messageContent.content}
                    </div>
                  ))}
                {reactions.length > 2 && (
                  <div className="text-xs">+{reactions.length - 2}</div>
                )}
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className=" p-0 w-fit border-transparent rounded-md"
              >
                <Tabs defaultValue={"all"} className="w-fit">
                  <TabsList className="w-full flex justify-start items-start">
                    <TabsTrigger value={"all"}>All</TabsTrigger>
                    {reactions
                      ?.reduce((uniqueReactions: IMessage[], reaction) => {
                        if (
                          !uniqueReactions.some(
                            (r) =>
                              r.messageContent.content ===
                              reaction.messageContent.content
                          )
                        ) {
                          uniqueReactions.push(reaction);
                        }
                        return uniqueReactions;
                      }, [])
                      .map((reaction, i) => (
                        <TabsTrigger
                          key={i}
                          value={reaction.messageContent.content.toLowerCase()}
                        >
                          {reaction.messageContent.content}
                        </TabsTrigger>
                      ))}
                  </TabsList>

                  <TabsContent value={"all"}>
                    <div className="flex flex-col p-4 gap-2">
                      {reactions
                        ?.reduce((uniqueReactions: IMessage[], reaction) => {
                          if (
                            !uniqueReactions.some(
                              (r) =>
                                r.messageContent.content ===
                                reaction.messageContent.content
                            )
                          ) {
                            uniqueReactions.push(reaction);
                          }
                          return uniqueReactions;
                        }, [])
                        .map((reaction, i) => (
                          <div
                            key={i}
                            className="text-xs text-muted-foreground"
                          >
                            {reaction.messageContent.content} -{" "}
                            {trimAddress(reaction.from.slice(7))}
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  {reactions
                    ?.reduce((uniqueReactions: IMessage[], reaction) => {
                      if (
                        !uniqueReactions.some(
                          (r) =>
                            r.messageContent.content ===
                            reaction.messageContent.content
                        )
                      ) {
                        uniqueReactions.push(reaction);
                      }
                      return uniqueReactions;
                    }, [])
                    .map((reaction, i) => (
                      <TabsContent
                        key={i}
                        value={reaction.messageContent.content.toLowerCase()}
                      >
                        <div className="flex flex-col p-4 gap-2">
                          {reactions
                            .filter(
                              (r) =>
                                r.messageContent.content ===
                                reaction.messageContent.content
                            )
                            .map((reaction, i) => (
                              <div
                                key={i}
                                className="text-xs text-muted-foreground"
                              >
                                {trimAddress(reaction.from.slice(7))}
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    ))}
                </Tabs>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
