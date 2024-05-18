"use client";
import {usePushUser} from "@/providers/push-provider";

const usePush = () => {
  const {pushUser} = usePushUser();

  const sendMessages = async (recipient: string, message: string) => {
    if (!pushUser) return;
    await pushUser.chat.send(recipient, {content: message});
  };

  const fetchChats = async () => {
    if (!pushUser) return;
    const messages = await pushUser.chat.list("CHATS");

    return messages;
  };
  const fetchRequests = async () => {
    if (!pushUser) return;
    const messages = await pushUser.chat.list("REQUESTS");

    return messages;
  };

  const fetchUser = async (account: string) => {
    if (!pushUser) return;
    const user = await pushUser.info({
      overrideAccount: account,
    });

    return user;
  };
  const fetchGroupInfo = async (chatId: string) => {
    if (!pushUser) return;
    const groupInfo = await pushUser.chat.group.info(chatId);
    return groupInfo;
  };
  const fetchAllMessages = async (chatId: string) => {
    if (!pushUser) return;
    const messages = await pushUser.chat.history(chatId, {
      limit: 20,
    });
    return messages;
  };

  const fetchChatStatus = async (chatId: string) => {
    if (!pushUser) return;
    const chatStatus = await pushUser.chat.info(chatId);
    return chatStatus;
  };

  const acceptChatRequest = async (chatId: string) => {
    if (!pushUser) return;
    await pushUser.chat.accept(chatId);
  };

  const rejectChatRequest = async (chatId: string) => {
    if (!pushUser) return;
    await pushUser.chat.reject(chatId);
  };
  return {
    sendMessages,
    fetchChats,
    fetchRequests,
    fetchUser,
    fetchGroupInfo,
    fetchAllMessages,
    fetchChatStatus,
    acceptChatRequest,
    rejectChatRequest,
  };
};

export default usePush;
