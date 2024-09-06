import React from "react";
import UserInfoCard from "./chat/user-info-card";
import {Caveat} from "next/font/google";
import ChatSidebar from "./chat/chat-sidebar";
import ChatMessageWindow from "./chat/chat-message-window";

const caveat = Caveat({subsets: ["latin"]});

const ChatWindow = () => {
  return (
    <>
      <section className="hidden md:flex h-screen  w-screen  m-auto bg-muted/40 backdrop-blur-md border border-white/20  flex-row gap-2 p-2 overflow-y-hidden">
        <section className="w-[40%] lg:w-[30%] 2xl:w-[25%] flex flex-col gap-1">
          <UserInfoCard />
          <ChatSidebar />
        </section>

        <section className="w-[60%] h-full lg:w-[70%] 2xl:w-[75%]">
          <ChatMessageWindow />
        </section>
      </section>

      <section className="md:hidden flex h-screen  w-screen  m-auto bg-muted/40 backdrop-blur-md  flex-row gap-2 p-2 overflow-y-hidden">
        <section className="w-full flex flex-col gap-1">
          <div className="bg-black rounded-md flex justify-center items-center py-2">
            <h2
              className={`${caveat.className} text-4xl md:text-7xl text-pretty bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent`}
            >
              PrivyChat
            </h2>
          </div>

          <ChatSidebar />
        </section>
      </section>
    </>
  );
};

export default ChatWindow;
