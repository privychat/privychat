"use client";
import axios from "axios";

import {useAppContext} from "./use-app-context";
import {MESSAGE_TYPE} from "@/constants";
import {IChat, SendMessageParams} from "@/types";
import {getAddress} from "viem";
import {Message} from "@pushprotocol/restapi";
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
  }: SendMessageParams): Promise<any> => {
    if (!pushUser) {
      throw new Error("User not authenticated");
    }

    try {
      let messageToSend: Message;

      if (type === MESSAGE_TYPE.REACTION) {
        if (typeof message !== "string" || !reference) {
          throw new Error("Invalid parameters for REACTION message");
        }
        messageToSend = {
          content: message,
          type,
          reference,
        };
      } else if (type === MESSAGE_TYPE.REPLY) {
        if (typeof message !== "object" || !reference) {
          throw new Error("Invalid parameters for REPLY message");
        }
        messageToSend = {
          content: message,
          type,
          reference,
        };
      } else {
        if (typeof message !== "string") {
          throw new Error(
            "Invalid message type for non-REACTION and non-REPLY messages"
          );
        }
        messageToSend = {
          content: message,
          type,
        };
      }

      return await pushUser.chat.send(chatId, messageToSend);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const getMessageInfo = async (cid: string, sender: string) => {
    if (!pushUser) {
      throw new Error("User not authenticated");
    }
    try {
      const messageInfo = await pushUser.chat.message(sender, {
        reference: cid,
      });
      return messageInfo;
    } catch (error) {
      console.error("Error getting message info:", error);
      throw error;
    }
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
    getMessageInfo,
    addContact,
    pinChat,
    removePinChat,
  };
};

export default usePush;
