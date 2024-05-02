import React from "react";
import {Skeleton} from "../ui/skeleton";

const ChatItemListLoader = () => {
  return (
    <div className="max-w-[400px] w-[400px] flex flex-col">
      <div className="flex items-center space-x-4  p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
      <div className="flex items-center space-x-4  p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>{" "}
      <div className="flex items-center space-x-4  p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>{" "}
      <div className="flex items-center space-x-4  p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
    </div>
  );
};

export default ChatItemListLoader;
