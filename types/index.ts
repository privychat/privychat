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
  setFeeds: React.Dispatch<React.SetStateAction<IFeeds[] | null>>;
  requests: IFeeds[] | null;
  setRequests: React.Dispatch<React.SetStateAction<IFeeds[] | null>>;
  feedContent: {[key: string]: IMessage[] | null}; // chatid -> chat.history []
  setFeedContent: React.Dispatch<
    React.SetStateAction<{[key: string]: IMessage[] | null}>
  >;
  fetchingChats: {
    feeds: {
      allPagesFetched: boolean;
      fetching: boolean;
    };
    requests: {
      allPagesFetched: boolean;
      fetching: boolean;
    };
  };
}
interface IAppContext {
  isUserAuthenticated: boolean;
  setIsUserAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
  pushUser: PushAPI | null;
  setPushUser: React.Dispatch<React.SetStateAction<PushAPI | null>>;
  userInfo: IUser | null;
  setUserInfo: React.Dispatch<React.SetStateAction<IUser | null>>;
  chat: IChat | null;
  pushStream: any | null;
  setPushStream: React.Dispatch<React.SetStateAction<any | null>>;
  streamMessage: any | null;
  setStreamMessage: React.Dispatch<React.SetStateAction<any | null>>;
  activeChat: IFeeds | null; // IFeed of the chat active
  setActiveChat: React.Dispatch<React.SetStateAction<IFeeds | null>>;
  chatSearch: string;
  setChatSearch: React.Dispatch<React.SetStateAction<string>>;
  activeChatTab: "all" | "requests" | "pinned" | "archived" | "groups";
  setActiveChatTab: React.Dispatch<
    React.SetStateAction<"all" | "requests" | "pinned" | "archived" | "groups">
  >;
}

export type {IAppContext, IChat, IMessage};
