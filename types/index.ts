import {CONSTANTS, IFeeds, IUser, PushAPI} from "@pushprotocol/restapi";

interface IMessage {
  cid: string;
  to: string;
  from: string;
  type: string;
  messageContent: {content: string; reference?: string};
  timestamp: number;
}
interface IChat {
  feeds: IFeeds[] | null;
  setFeeds: (feeds: IFeeds[] | null) => void;
  requests: IFeeds[] | null;
  setRequests: (requests: IFeeds[] | null) => void;
  feedContent: {[key: string]: IMessage[] | null}; // chatid -> chat.history []
  setFeedContent: (feedContent: {[key: string]: IMessage[] | null}) => void;
}
interface IAppContext {
  isUserAuthenticated: boolean;
  setIsUserAuthenticated: (isAuthenticated: boolean) => void;
  account: string | null;
  setAccount: (account: string | null) => void;
  pushUser: PushAPI | null;
  setPushUser: (user: PushAPI | null) => void;
  userInfo: IUser | null;
  setUserInfo: (userInfo: IUser | null) => void;
  chat: IChat | null;
  setFeeds: (feeds: IFeeds[] | null) => void;
  setRequests: (requests: IFeeds[] | null) => void;
  pushStream: any | null;
  setPushStream: (pushStream: any | null) => void;
  streamMessage: any | null;
  setStreamMessage: (streamMessage: any) => void;
  activeChat: IFeeds | null; // IFeed of the chat active
  setActiveChat: (chatid: IFeeds | null) => void;
  chatSearch: string;
  setChatSearch: (search: string) => void;
  activeChatTab: "all" | "requests" | "pinned" | "archived" | "groups";
  setActiveChatTab: (
    tab: "all" | "requests" | "pinned" | "archived" | "groups"
  ) => void;
}

export type {IAppContext, IChat, IMessage};
