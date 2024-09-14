import {CHAT_TYPE} from "@/constants";
import {CONSTANTS, IFeeds, IUser, PushAPI} from "@pushprotocol/restapi";

interface IStreamMessage {
  event: string;
  origin: string;
  timestamp: string;
  chatId: string;
  from: string;
  to: string[];
  message: {
    type: string;
    content: string;
  };
  meta: {
    group: boolean;
  };
  reference: string;
}
interface IMessage {
  cid: string;
  to: string;
  from: string;
  type: string;
  messageContent: {content: string; reference?: string};
  timestamp: number;
  link: string;
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
  chatHistoryLoaders: {[key: string]: boolean};
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
  activeChatTab: CHAT_TYPE;
  setActiveChatTab: React.Dispatch<React.SetStateAction<CHAT_TYPE>>;
}

interface IChatBubbleProps {
  message: string;
  sender: string;
  timestamp: number;
  titleColor?: string;
  messageType: string;
  reactions?: IMessage[];
  cid: string;
}
export type {IAppContext, IChat, IMessage, IStreamMessage, IChatBubbleProps};
