"use client";
import React, {Suspense as ReactSuspense} from "react";

import {usePushUser} from "@/providers/push-provider";
import {useParams} from "next/navigation";
import ChatWindowSidebar from "@/components/chat/chat-window-sidebar";
import LoggedOutView from "@/components/ui/logged-out-view";

const ChatsPage = () => {
  const {userChats, userChatRequests} = usePushUser();

  const {request: isARequest} = useParams();

  return (
    <ReactSuspense fallback={<div>Loading...</div>}>
      <div className="flex flex-row gap-2 min-h-screen max-h-screen overflow-y-hidden p-4">
        <ChatWindowSidebar
          userChats={userChats}
          userChatRequests={userChatRequests}
          isARequest={isARequest as string}
          chatId={""}
        />
        <div className="md:hidden flex items-center justify-center">
          <div className="md:hidden flex items-center justify-center">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
              Privy Chat is currently only optimised for desktop experience.
              Please visit on a desktop browser.
            </h2>
          </div>{" "}
        </div>
        <LoggedOutView />
      </div>
    </ReactSuspense>
  );
};

export default ChatsPage;
