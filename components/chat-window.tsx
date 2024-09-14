import React, {useEffect, useState} from "react";
import UserInfoCard from "./chat/user-info-card";
import ChatSidebar from "./chat/chat-sidebar";
import ChatMessageWindow from "./chat/chat-message-window";

import {Sheet, SheetContent} from "@/components/ui/sheet";

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="hidden md:flex h-screen  w-screen  m-auto bg-muted/40 backdrop-blur-md   flex-row gap-2 p-2 overflow-y-hidden">
        <section className="w-[40%] lg:w-[30%] 2xl:w-[25%] flex flex-col gap-1">
          <UserInfoCard />
          <ChatSidebar />
        </section>

        <section className="w-[60%] h-full lg:w-[70%] 2xl:w-[75%]">
          <ChatMessageWindow />
        </section>
      </section>

      <section className="md:hidden flex h-screen  w-screen  m-auto bg-muted/40 backdrop-blur-md overflow-hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <section className="w-full flex flex-col">
            <div className=" bg-black scroll-m-20 px-4 pt-4 ">
              <h3 className="text-2xl font-semibold tracking-tight"> Chats</h3>
            </div>
            <ChatSidebar
              openSheet={() => {
                setIsOpen(true);
              }}
            />
          </section>
          <SheetContent className="w-screen border-none p-0">
            <ChatMessageWindow
              closeSheet={() => {
                setIsOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </section>
    </>
  );
};

export default ChatWindow;
