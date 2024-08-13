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
interface ChatPageProps {
  params: {
    chatId: string;
  };
}
const ChatPage: React.FC<ChatPageProps> = ({params}) => {
  const {pushUser, latestMessage, userChats, userChatRequests} = usePushUser();
  const {fetchChats, fetchRequests} = usePush();

  const currentChatId = params.chatId;

  const {request: isARequest} = useParams();

  return (
    <ReactSuspense fallback={<div>Loading...</div>}>
      <div className="flex flex-row gap-2 p-2 min-h-screen max-h-screen">
        <div className="max-w-[400px] w-[400px] hidden md:flex flex-col ">
          <UserInfo />

          <Tabs
            defaultValue={isARequest ? "requests" : "chats"}
            className="w-[400px] py-2"
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
                {userChatRequests && userChatRequests.length > 0 && (
                  <Badge variant="default" className="ml-2 rounded-full">
                    {userChatRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chats">
              {userChats ? (
                <ChatItemList chats={userChats} selectedChat={currentChatId} />
              ) : (
                <ChatItemListLoader />
              )}
            </TabsContent>
            <TabsContent value="requests">
              {userChatRequests ? (
                <ChatItemList
                  chats={userChatRequests}
                  selectedChat={currentChatId}
                  isInRequestsTab={true}
                />
              ) : (
                <ChatItemListLoader />
              )}
            </TabsContent>
          </Tabs>
        </div>
        <div className="md:hidden flex items-center justify-center">
          <div className="md:hidden flex items-center justify-center">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
              Privy Chat is currently only optimised for desktop experience.
              Please visit on a desktop browser.
            </h2>
          </div>{" "}
        </div>
      </div>
    </ReactSuspense>
  );
};

export default ChatPage;
