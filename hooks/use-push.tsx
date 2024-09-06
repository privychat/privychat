"use client";
import axios from "axios";

import {useAppContext} from "./use-app-context";

const usePush = () => {
  const {pushUser} = useAppContext();

  const resolveDomain = async (
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
      return chatHistory.map((message) => ({
        cid: message.cid,
        from: message.fromDID,
        to: message.toDID,
        timestamp: message.timestamp,
        messageContent: {
          content: message.messageObj.content,
          reference: message.messageObj.reference || undefined,
        },
        type: message.messageType,
      }));
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
    resolveDomain,
  };
};

export default usePush;
