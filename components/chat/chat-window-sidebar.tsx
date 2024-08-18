import React, {useEffect} from "react";
import UserInfo from "./user-info";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {Badge} from "../ui/badge";
import ChatItemList from "./chat-item-list";
import ChatItemListLoader from "./chat-item-list-loader";
import {IFeeds} from "@pushprotocol/restapi";
import {usePushUser} from "@/providers/push-provider";

const ChatWindowSidebar = ({
  userChats,
  userChatRequests,
  isARequest,
  chatId,
}: {
  userChats: IFeeds[] | undefined;
  userChatRequests: IFeeds[] | undefined;
  isARequest: string;
  chatId: string;
}) => {
  const {latestMessage, setUserChats, pushUser} = usePushUser();

  useEffect(() => {
    const handleNewChat = async () => {
      if (latestMessage && latestMessage.origin === "internal" && userChats) {
        const existingChat = userChats?.find(
          (chat) => chat.chatId === latestMessage.chatId
        );
        if (!existingChat) {
          const lastChat = await pushUser?.chat.list("CHATS", {limit: 1});
          console.log("lastChat", lastChat);
          // if (lastChat) setUserChats([lastChat[0], ...userChats]);
        }
      }
    };
    handleNewChat();
  }, [latestMessage]);
  return (
    <div className="max-w-[400px] min-w-[400px] hidden md:flex flex-col min-h-[90vh]">
      <div className="h-[4%] mb-8">
        <UserInfo />
      </div>

      <Tabs
        defaultValue={isARequest ? "requests" : "chats"}
        className="w-full py-2 h-[84%] max-y-screen"
      >
        <TabsList className="w-full flex  justify-evenly">
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
        <TabsContent value="chats" className="h-full">
          {userChats ? (
            <ChatItemList chats={userChats} selectedChat={chatId} />
          ) : (
            <ChatItemListLoader />
          )}
        </TabsContent>
        <TabsContent value="requests" className="h-full">
          {userChatRequests ? (
            <ChatItemList
              chats={userChatRequests}
              isInRequestsTab={true}
              selectedChat={chatId}
            />
          ) : (
            <ChatItemListLoader />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatWindowSidebar;
