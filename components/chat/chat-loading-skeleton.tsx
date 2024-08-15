import React from "react";
import {Skeleton} from "../ui/skeleton";

const ChatLoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end space-y-2 my-2 mr-2">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px] rounded-md" />
        </div>
      </div>
      <div className="flex justify-start space-y-2 my-2 ml-2">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px] rounded-md" />
        </div>
      </div>
      <div className="flex justify-end space-y-2 my-2 mr-2">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px] rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingSkeleton;
