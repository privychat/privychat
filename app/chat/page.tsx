"use client";
import React, {
  Suspense as ReactSuspense,
  useEffect,
  useRef,
  useState,
} from "react";
import {CONSTANTS, IFeeds} from "@pushprotocol/restapi";
import ChatItemList from "@/components/chat/chat-item-list";
import {usePushUser} from "@/providers/push-provider";
import UserInfo from "@/components/chat/user-info";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ChatItemListLoader from "@/components/chat/chat-item-list-loader";
import {Badge} from "@/components/ui/badge";
import usePush from "@/app/hooks/usePush";
import {useParams} from "next/navigation";
import ChatWindowSidebar from "@/components/chat/chat-window-sidebar";
import LoggedOutView from "@/components/logged-out-view";

const ChatsPage = () => {
  const {userChats, userChatRequests} = usePushUser();

  const {request: isARequest} = useParams();

  return (
    <ReactSuspense fallback={<div>Loading...</div>}>
      <div className="flex flex-row gap-2 min-h-screen max-h-screen overflow-y-hidden p-2">
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
