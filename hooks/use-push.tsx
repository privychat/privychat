"use client";
import axios from "axios";

import {useAppContext} from "./use-app-context";
import {MESSAGE_TYPE} from "@/constants";
import {IChat, IStreamMessage} from "@/types";
import {getAddress} from "viem";
const usePush = () => {
  const {pushUser, chat, account} = useAppContext();
  const {setFeedContent} = chat as IChat;

  const reverseResolveDomain = async (
    address: string
  ): Promise<{name: string} | {error: any}> => {
    try {
      const resolvedDomain = await axios.get(
        `/api/reverse-resolve-domains?address=${address}`
      );
      return {
        name: resolvedDomain.data,
      };
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const resolveDomain = async (domain: string) => {
    try {
      const resolvedDomain = await axios.get(
        `/api/resolve-domain?domain=${domain}`
      );
      return resolvedDomain.data.address;
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const addContact = async (address: string, name: string) => {
    try {
      const response = await axios.put(
        `/api/user?address=${getAddress(account!)}`,
        {
          address,
          name,
        }
      );
      if (response.data.success) {
        return response.data.data.contacts;
      }
      return {
        error: response.data.error,
      };
    } catch (error) {
      return {
        error: error,
      };
    }
  };
  const getUserInfo = async ({overrideAccount}: {overrideAccount?: string}) => {
    if (!pushUser)
      return {
        error: "User not authenticated",
      };
    try {
      const userInfo = await pushUser.info({
        ...(overrideAccount && {overrideAccount}),
      });
      return userInfo;
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const getChats = async ({
    limit = 10,
    page = 1,
  }: {
    limit?: number;
    page?: number;
  }) => {
    if (!pushUser)
      return {
        error: "User not authenticated",
      };
    try {
      const chats = await pushUser.chat.list("CHATS", {
        limit,
        page,
      });
      return chats;
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const getRequests = async ({
    limit = 10,
    page = 1,
  }: {
    limit?: number;
    page?: number;
  }) => {
    if (!pushUser)
      return {
        error: "User not authenticated",
      };
    try {
      const requests = await pushUser.chat.list("REQUESTS", {
        limit,
        page,
      });
      return requests;
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const getChatHistory = async ({
    chatId,
    limit = 15,
    reference,
  }: {
    chatId: string;
    limit?: number;
    reference?: string;
  }) => {
    if (!pushUser)
      return {
        error: "User not authenticated",
      };
    try {
      const chatHistory = await pushUser.chat.history(chatId, {
        limit,
        ...(reference && {reference}),
      });
      return chatHistory
        .map((message) => ({
          cid: message.cid,
          from: message.fromDID,
          to: message.toDID,
          timestamp: message.timestamp,
          messageContent: {
            content: message.messageObj.content,
            ...(message.messageObj.reference && {
              reference: message.messageObj.reference,
            }),
          },
          link: message.link,
          type: message.messageType,
        }))
        .reverse();
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const sendMessage = async ({
    chatId,
    message,
    reference,
    type,
  }: {
    chatId: string;
    message: string;
    reference?: string;
    type: MESSAGE_TYPE;
  }) => {
    if (!pushUser)
      return {
        error: "User not authenticated",
      };
    try {
      if (type === MESSAGE_TYPE.REACTION) {
        const sentMessage = await pushUser.chat.send(chatId, {
          content: message,
          type: type,
          reference: reference!,
        });
        return sentMessage;
      } else {
        const sentMessage = await pushUser.chat.send(chatId, {
          content: message,
          type: type,
        });
        return sentMessage;
      }
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const incomingMessageHandler = async (stream: IStreamMessage) => {
    if (stream.event !== "chat.message") return;
    const {chatId, from, message, meta, timestamp, reference} = stream;
    setFeedContent((prev) => {
      const currentChatHistory = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: [
          ...currentChatHistory,
          {
            cid: reference,
            from: from,
            to: chatId,
            timestamp: new Date(timestamp).getTime(),
            messageContent: {
              content: message.content,
            },
            link: "",
            type: message.type,
          },
        ],
      };
    });
  };

  const pinChat = async (chatId: string) => {
    try {
      const response = await axios.post(`/api/pin-chat`, {
        chatId,
        account,
      });
      return response.data;
    } catch (error) {
      return {
        error: error,
      };
    }
  };

  const removePinChat = async (chatId: string) => {
    try {
      const response = await axios.delete(`/api/pin-chat`, {
        data: {
          chatId,
          account,
        },
      });
      return response.data;
    } catch (error) {
      return {
        error: error,
      };
    }
  };
  return {
    getUserInfo,
    getChats,
    getRequests,
    getChatHistory,
    reverseResolveDomain,
    sendMessage,
    resolveDomain,
    incomingMessageHandler,
    addContact,
    pinChat,
    removePinChat,
  };
};

export default usePush;
