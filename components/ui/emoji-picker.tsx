import React, {useEffect} from "react";
import {SmileIcon} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import {Theme} from "emoji-picker-react";
import {useAppContext} from "@/hooks/use-app-context";
import usePush from "@/hooks/use-push";
import {IChat} from "@/types";
import {generateRandomString} from "@/lib/utils";
import {MESSAGE_TYPE} from "@/constants";

const EmojiPickerTab = ({
  showEmojiPicker,
  setShowEmojiPicker,
  isSelfMessage,
  messageCid,
  onClose,
}: {
  showEmojiPicker: boolean;
  isSelfMessage: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  messageCid: string;
  onClose?: () => void;
}) => {
  const {chat, activeChat, account} = useAppContext();
  const {setFeedContent} = chat as IChat;
  const {sendMessage} = usePush();
  const handleSendReaction = (e: any) => {
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
              content: e.emoji,
              reference: messageCid,
            },
            link: randomId,
            type: MESSAGE_TYPE.REACTION,
          },
        ],
      };
    });

    sendMessage({
      message: e.emoji,
      reference: messageCid,
      chatId: activeChat?.chatId!,
      type: MESSAGE_TYPE.REACTION,
    });
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        onClose &&
        !e.composedPath().includes(document.getElementById("emoji-picker")!)
      ) {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);
  return (
    <div
      className={`absolute bottom-2 p-0 ${
        isSelfMessage ? "-left-10" : "-right-10"
      }`}
      id="emoji-picker"
    >
      <div className="relative">
        <SmileIcon
          className="text-white/50 cursor-pointer"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        {showEmojiPicker && (
          <div
            className={`absolute -top-4 transform ${
              isSelfMessage
                ? "-left-1 -translate-x-full"
                : "-right-1 translate-x-full"
            }`}
          >
            <EmojiPicker
              theme={Theme.DARK}
              reactionsDefaultOpen={true}
              skinTonesDisabled={true}
              onReactionClick={handleSendReaction}
              allowExpandReactions={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPickerTab;
