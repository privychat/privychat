import React from "react";
import {Skeleton} from "../ui/skeleton";

const ChatHistoryLoader = () => {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="w-full flex justify-start">
        <Skeleton className="rounded-md w-[40%] h-10 bg-gray-800" />
      </div>
      <div className="w-full flex justify-end">
        <Skeleton className="rounded-md w-[40%] h-10 bg-gray-800" />
      </div>
    </div>
  );
};

export default ChatHistoryLoader;
