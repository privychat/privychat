import React, {useEffect, useRef, useState} from "react";
import {Input} from "../ui/input";
import {Search, Send} from "lucide-react";
import {Button} from "../ui/button";
import usePush from "@/app/hooks/usePush";
import {usePushUser} from "@/providers/push-provider";
import {useAccount} from "wagmi";
interface ChatMessageInputProps {
  chatId: string;
}
const ChatMessageInput: React.FC<ChatMessageInputProps> = ({chatId}) => {
  const [inputMessage, setInputMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const {address} = useAccount();
  const {sendMessages} = usePush();
  const {setLatestMessage} = usePushUser();
  const sendMessage = async () => {
    if (inputMessage.trim().length === 0) return;

    setLatestMessage({
      origin: "internal",
      chatId: chatId,
      message: {
        content: inputMessage,
        type: "Text",
      },
      from: `eip155:${address}`,
      to: [`eip155:${chatId}`],
      timestamp: new Date().getTime(),
    });
    sendMessages(chatId, inputMessage);
    setInputMessage("");
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Automatically focus the input field on mount
    }
  }, []);
  return (
    <div className="flex flex-row gap-2 mb-2">
      <Input
        type="search"
        ref={inputRef}
        placeholder="type your message"
        className="w-full rounded-lg bg-background py-6"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <Button
        variant="outline"
        size="icon"
        className="bg-primary flex  items-center justify-center h-12 w-12 mr-2"
      >
        <Send onClick={sendMessage} />
      </Button>
    </div>
  );
};

export default ChatMessageInput;
