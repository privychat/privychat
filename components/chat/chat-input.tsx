import React from "react";
import {Input} from "../ui/input";

const ChatInput = () => {
  return (
    <div className="rounded-md h-20 mx-2 bg-gray-600  bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 flex flex-row gap-4 items-center px-4">
      <Input />
    </div>
  );
};

export default ChatInput;
