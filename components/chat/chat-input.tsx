import React, {useState} from "react";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {Send} from "lucide-react";
import usePush from "@/hooks/use-push";
import {useAppContext} from "@/hooks/use-app-context";
import {MESSAGE_TYPE} from "@/constants";

const ChatInput = () => {
  const [input, setInput] = useState<string>("");
  const {sendMessage} = usePush();
  const {activeChat} = useAppContext();
  const handleSend = async () => {
    if (input.trim() !== "") {
      const startTime = new Date().getTime();
      await sendMessage({
        message: input,
        chatId: activeChat?.chatId!,
        type: MESSAGE_TYPE.TEXT,
      });
      console.log(
        "Time taken to send message",
        new Date().getTime() - startTime + "ms"
      );
      setInput("");
    }
  };

  return (
    <div className="flex flex-row items-center justify-center h-14 rounded-md p-2 pt-1">
      <Input
        className="w-full h-full bg-secondary rounded-full rounded-r-none text-sm"
        placeholder="Type a message"
        autoFocus={true}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />
      <Button
        className="bg-primary h-full cursor-pointer rounded-full rounded-l-none"
        onClick={handleSend}
      >
        <Send />
      </Button>
    </div>
  );
};

export default ChatInput;
