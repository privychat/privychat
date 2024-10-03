import React, {useEffect, useState, useMemo} from "react";
import Image from "next/image";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DEFAULT_PFP, MESSAGE_TYPE} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {convertUnixTimestampToHHMM, trimAddress} from "@/lib/utils";
import {IChatBubbleProps, IMessage} from "@/types";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";

import EmojiPickerTab from "../ui/emoji-picker";
import ChatMessageProcessor from "./chat-message-processor";
import NewContactButton from "../contact-book/new-contact-button";
import {CheckCheck} from "lucide-react";
const ChatBubble: React.FC<IChatBubbleProps> = ({
  message,
  sender,
  timestamp,
  titleColor,
  messageType,
  reactions,
  cid,
  lastSeenTimeStampSender,
}) => {
  const {account, activeChat, contactBook} = useAppContext();
  const {getUserInfo, reverseResolveDomain} = usePush();
  const isSelfMessage = sender.slice(7) === account;
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [userHoverOnMessage, setUserHoverOnMessage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  useEffect(() => {
    const fetchSenderInfo = async () => {
      if (activeChat?.isGroup) {
        const member = activeChat?.groupParticipants?.find(
          (member) => member.wallet === sender
        );
        if (!member?.image) {
          const senderDetails = await getUserInfo({overrideAccount: sender});
          if (!("error" in senderDetails)) {
            setSenderImage(senderDetails.profile.picture || DEFAULT_PFP);
          }
        } else {
          setSenderImage(member.image);
        }

        const name = await reverseResolveDomain(sender.slice(7));
        if (!("error" in name)) {
          setSenderName(name.name[0]);
        }
      }
    };

    fetchSenderInfo();
  }, [activeChat, sender, getUserInfo, reverseResolveDomain]);

  const uniqueReactions = useMemo(() => {
    return (
      reactions?.reduce((unique: IMessage[], reaction) => {
        if (
          !unique.some(
            (r) => r.messageContent.content === reaction.messageContent.content
          )
        ) {
          unique.push(reaction);
        }
        return unique;
      }, []) || []
    );
  }, [reactions]);

  const renderMessageContent = () => {
    switch (messageType) {
      case MESSAGE_TYPE.TEXT:
        return <ChatMessageProcessor message={message} />;
      case MESSAGE_TYPE.IMAGE:
      case MESSAGE_TYPE.GIF:
        const src =
          messageType === MESSAGE_TYPE.IMAGE
            ? JSON.parse(message).content
            : message;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Image
                src={src}
                alt="image"
                width={400}
                height={300}
                className="rounded-md w-[400px] h-auto pt-2 cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="border-none w-[70vw] p-0  bg-transparent">
              <Image
                src={src}
                alt="image"
                width={1200}
                height={1200}
                className=" w-full h-auto pt-2 rounded-md"
              />
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  const renderReactions = () => {
    if (!reactions || reactions.length === 0) return null;

    return (
      <div className="absolute -bottom-4 left-2">
        <Popover>
          <PopoverTrigger className="flex flex-row bg-gray-800 px-3 py-[6px] w-fit rounded-full gap-2">
            {uniqueReactions.slice(0, 2).map((reaction, i) => (
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
            className="p-0 w-fit border-transparent rounded-md"
          >
            <Tabs defaultValue="all" className="w-fit">
              <TabsList className="w-full flex justify-start items-start">
                <TabsTrigger value="all">All</TabsTrigger>
                {uniqueReactions.map((reaction, i) => (
                  <TabsTrigger
                    key={i}
                    value={reaction.messageContent.content.toLowerCase()}
                  >
                    {reaction.messageContent.content}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="flex flex-col p-4 gap-2">
                  {uniqueReactions.map((reaction, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      {reaction.messageContent.content} -{" "}
                      {trimAddress(reaction.from.slice(7))}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {uniqueReactions.map((reaction, i) => (
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
                        <div key={i} className="text-xs text-muted-foreground">
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
    );
  };

  return (
    <div
      className={`relative flex flex-row ${
        isSelfMessage ? "justify-end" : "justify-start "
      }`}
      onMouseEnter={() => {
        if (showEmojiPicker) return;
        setUserHoverOnMessage(true);
      }}
      onMouseLeave={() => {
        if (showEmojiPicker) return;
        setUserHoverOnMessage(false);
        setShowEmojiPicker(false);
      }}
    >
      {activeChat?.isGroup && !isSelfMessage && (
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
        className={`relative flex flex-col rounded-md w-fit min-w-[35%] md:min-w-[20%] max-w-[80%] md:max-w-[60%] bg-secondary ${
          reactions && reactions.length > 0 ? "mb-4" : "mb-0"
        }`}
      >
        {activeChat?.isGroup && !isSelfMessage && (
          <div className="flex flex-row gap-2 items-center px-3 pt-3 pb-0">
            <p className=" text-[12px]" style={{color: titleColor}}>
              {contactBook[sender.slice(7)] ||
                senderName ||
                trimAddress(sender.slice(7))}
            </p>
            {!(sender.slice(7) in contactBook) && (
              <NewContactButton inputAddress={sender?.slice(7)} chat />
            )}
          </div>
        )}

        {renderMessageContent()}
        <div className="flex flex-row justify-end items-center">
          <span
            className={`text-[10px] mt-1 pb-1 pr-2 text-right text-muted-foreground ${
              messageType !== MESSAGE_TYPE.TEXT
                ? "absolute bottom-0 right-0 font-medium"
                : ""
            }`}
          >
            {convertUnixTimestampToHHMM(timestamp)}
          </span>
          {sender.slice(7).toLowerCase() === account!.toLowerCase() && (
            <CheckCheck
              size={"16px"}
              className={`mr-2 ${
                lastSeenTimeStampSender && lastSeenTimeStampSender > timestamp
                  ? "text-blue-400 "
                  : "text-muted-foreground"
              }`}
            />
          )}
        </div>
        {renderReactions()}
        {userHoverOnMessage && (
          <EmojiPickerTab
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            isSelfMessage={isSelfMessage}
            messageCid={cid}
            onClose={() => {
              setUserHoverOnMessage(false);
              setShowEmojiPicker(false);
            }}
          />
        )}
      </div>{" "}
    </div>
  );
};

export default ChatBubble;
