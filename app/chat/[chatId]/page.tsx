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

import {useParams} from "next/navigation";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}
const ChatPage: React.FC<ChatPageProps> = ({params}) => {
  const [chats, setChats] = useState<IFeeds[] | undefined>();
  const [requests, setRequests] = useState<IFeeds[] | undefined>();
  const {pushUser, latestMessage} = usePushUser();
  const {fetchChats, fetchRequests} = usePush();
  const {request: isARequest} = useParams();

  const getChats = async () => {
    const chats = await fetchChats();

    if (!chats) return;
    setChats(chats);
  };

  const getRequests = async () => {
    const requests = await fetchRequests();

    if (!requests) return;
    setRequests(requests);
  };
  useEffect(() => {
    getChats();
    getRequests();
  }, [pushUser]);

  return (
    <div className="flex flex-row gap-2 p-2 min-h-screen max-h-screen">
      <div className="max-w-[400px] w-[400px] hidden md:flex flex-col">
        <UserInfo />

        <Tabs
          defaultValue={isARequest ? "requests" : "chats"}
          className="w-[405px] py-2 max-h-screen overflow-y-auto overflow-x-hidden"
        >
          <TabsList className="min-w-[400px] flex  justify-evenly">
            <TabsTrigger value="chats" className="w-[50%]">
              Chats
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="w-[50%] flex flex-row items-center "
            >
              <span>Requests</span>
              {requests && requests.length > 0 && (
                <Badge variant="default" className="ml-2 rounded-full">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chats">
            {chats ? (
              <ChatItemList chats={chats} selectedChat={params.chatId} />
            ) : (
              <ChatItemListLoader />
            )}
          </TabsContent>
          <TabsContent value="requests">
            {requests ? (
              <ChatItemList
                chats={requests}
                selectedChat={params.chatId}
                isInRequestsTab={true}
              />
            ) : (
              <ChatItemListLoader />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-full h-[98vh] hidden md:flex flex-col justify-between">
        <ChatItemInfo chatName={params.chatId} />
        <ChatMessagesWindow chatId={params.chatId} />
        <ChatMessageInput chatId={params.chatId} />
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
