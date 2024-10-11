import {CHAT_TYPE, MESSAGE_TYPE} from "@/constants";
import {GroupDTO, IUser, PushAPI} from "@pushprotocol/restapi";

interface IStreamMessage {
  event: string;
  origin: string;
  timestamp: string;
  chatId: string;
  from: string;
  to: string[];
  message: {
    type: string;
    content:
      | string
      | {
          messageText: string;
          messageObj: {
            content: string;
          };
        };
    reference?: string;
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
  messageContent: {
    content: string;
    reference?: string;
  };
  timestamp: number;
  link: string;
}
interface IFeeds {
  chatId: string;
  profilePicture: string;
  did: string;
  lastMessage: string;
  lastMessageTimestamp: number;
  isGroup: boolean;
  groupName?: string;
  groupParticipants?: GroupDTO["members"];
}
interface IChat {
  feeds: IFeeds[] | null;
  setFeeds: React.Dispatch<React.SetStateAction<IFeeds[] | null>>;
  requests: IFeeds[] | null;
  setRequests: React.Dispatch<React.SetStateAction<IFeeds[] | null>>;
  feedContent: {[key: string]: IMessage[] | null}; // chatid -> chat.history [] chats
  setFeedContent: React.Dispatch<
    React.SetStateAction<{[key: string]: IMessage[] | null}>
  >;
  requestsContent: {[key: string]: IMessage[] | null}; // chatid -> chat.history [] requests
  setRequestsContent: React.Dispatch<
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
  pinnedChats: string[];
  setPinnedChats: React.Dispatch<React.SetStateAction<string[]>>;
  lastSeenInfo: IlastSeenInfo[];
  setLastSeenInfo: React.Dispatch<React.SetStateAction<IlastSeenInfo[]>>;
  replyRef: {
    cid: string;
    message: string;
    sender: string;
  } | null;
  setReplyRef: React.Dispatch<
    React.SetStateAction<{
      cid: string;
      message: string;
      sender: string;
    } | null>
  >;
  latestStreamMessage: IStreamMessage | null;
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
  activeChat: IFeeds | null; // IFeed of the chat active
  setActiveChat: React.Dispatch<React.SetStateAction<IFeeds | null>>;
  chatSearch: string;
  setChatSearch: React.Dispatch<React.SetStateAction<string>>;
  activeChatTab: CHAT_TYPE;
  setActiveChatTab: React.Dispatch<React.SetStateAction<CHAT_TYPE>>;
  initializePushUser: () => Promise<any>;
  contactBook: {[key: string]: string};
  setContactBook: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
}

interface IChatBubbleProps {
  message: string;
  sender: string;
  timestamp: number;
  titleColor?: string;
  messageType: string;
  reactions?: IMessage[];
  cid: string;
  lastSeenTimeStampSender?: number;
  replyReference?: string;
}

interface IlastSeenInfo {
  chatId: string;
  timestamp: number;
  lastMessageHash: string;
}

type MessageContent = string | {type: string; content: string};

interface SendMessageParams {
  chatId: string;
  message: MessageContent;
  reference?: string;
  type: MESSAGE_TYPE;
}

interface BaseMessage {
  content: string | {type: string; content: string};
  type: MESSAGE_TYPE;
}

interface ReactionMessage extends BaseMessage {
  type: MESSAGE_TYPE.REACTION;
  reference: string;
}

interface ReplyMessage extends BaseMessage {
  type: MESSAGE_TYPE.REPLY;
  reference: string;
}

type Message = BaseMessage | ReactionMessage | ReplyMessage;
export type {
  IStreamMessage,
  IMessage,
  IFeeds,
  IChat,
  IAppContext,
  IChatBubbleProps,
  IlastSeenInfo,
  MessageContent,
  SendMessageParams,
};
