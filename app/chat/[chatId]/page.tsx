"use client";
import React, {useEffect, useRef, useState} from "react";
import {CONSTANTS, IFeeds} from "@pushprotocol/restapi";
import ChatItemList from "@/components/chat/chat-item-list";
import {usePushUser} from "@/providers/push-provider";
import UserInfo from "@/components/chat/user-info";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ChatItemListLoader from "@/components/chat/chat-item-list-loader";
import {Badge} from "@/components/ui/badge";
import usePush from "@/app/hooks/usePush";
import ChatItemInfo from "@/components/chat/chat-item-info";
import ChatMessagesWindow from "@/components/chat/chat-message-window";
import ChatMessageInput from "@/components/chat/chat-message-input";

import {useParams, useSearchParams} from "next/navigation";
import ChatWindowSidebar from "@/components/chat/chat-window-sidebar";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}
const ChatPage: React.FC<ChatPageProps> = ({params}) => {
  const {userChats, userChatRequests} = usePushUser();

  const searchParams = useSearchParams();
  const isARequest = searchParams.get("request");

  return (
    <div className="flex flex-row gap-2 min-h-screen max-h-screen overflow-y-hidden p-2">
      <ChatWindowSidebar
        userChats={userChats}
        userChatRequests={userChatRequests}
        isARequest={isARequest as string}
        chatId={params.chatId}
      />
      <div className="hidden md:flex flex-col min-h-[96vh] w-full justify-between">
        <ChatItemInfo chatName={params.chatId} />
        <ChatMessagesWindow chatId={params.chatId} />
        {!isARequest && <ChatMessageInput chatId={params.chatId} />}
      </div>

      <div className="md:hidden flex items-center justify-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
          Privy Chat is currently only optimised for desktop experience. Please
          visit on a desktop browser.
        </h2>
      </div>
    </div>
  );
};

export default ChatPage;
