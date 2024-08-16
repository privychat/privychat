"use client";
import {usePushUser} from "@/providers/push-provider";
import ChatItemInfo from "@/components/chat/chat-item-info";
import ChatMessagesWindow from "@/components/chat/chat-message-window";
import ChatMessageInput from "@/components/chat/chat-message-input";

import {useSearchParams} from "next/navigation";
import ChatWindowSidebar from "@/components/chat/chat-window-sidebar";
import {useEffect, useState} from "react";
import {publicClient} from "@/providers/privy-provider";
import {normalize} from "viem/ens";
import FullPageLoader from "@/components/ui/full-page-loader";
import LoggedOutView from "@/components/ui/logged-out-view";
interface ChatPageProps {
  params: {
    chatId: string;
  };
}
const ChatPage: React.FC<ChatPageProps> = ({params}) => {
  const [chatId, setChatId] = useState<string>("");
  const {userChats, userChatRequests} = usePushUser();

  const searchParams = useSearchParams();
  const isARequest = searchParams.get("request");
  const {pushUser} = usePushUser();

  useEffect(() => {
    const fetchENSAddress = async () => {
      try {
        const ensAddress = await publicClient.getEnsAddress({
          name: normalize(params.chatId),
        });
        if (ensAddress) {
          setChatId(ensAddress);
        } else {
          setChatId(params.chatId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (params.chatId.includes(".eth")) fetchENSAddress();
    else {
      setChatId(params.chatId);
    }
  }, []);
  if (!pushUser) return <FullPageLoader />;
  if (!chatId) {
    return <FullPageLoader />;
  }
  return (
    <div className="flex flex-row gap-2 min-h-screen max-h-screen overflow-y-hidden p-4">
      <ChatWindowSidebar
        userChats={userChats}
        userChatRequests={userChatRequests}
        isARequest={isARequest as string}
        chatId={chatId}
      />
      <div className="hidden md:flex flex-col min-h-[90vh] w-full justify-evenly">
        <ChatItemInfo chatName={chatId} />
        <ChatMessagesWindow chatId={chatId} />
        {!isARequest && <ChatMessageInput chatId={chatId} />}
      </div>

      <div className="md:hidden flex items-center justify-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
          Privy Chat is currently only optimised for desktop experience. Please
          visit on a desktop browser.
        </h2>
      </div>
      <LoggedOutView />
    </div>
  );
};

export default ChatPage;
