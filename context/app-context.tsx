import {CHAT_TYPE} from "@/constants";
import {IAppContext} from "@/types";
import {createContext} from "react";

const initialAppContext: IAppContext = {
  isUserAuthenticated: false,
  setIsUserAuthenticated: () => {},
  account: null,
  setAccount: () => {},
  pushUser: null,
  setPushUser: () => {},
  userInfo: null,
  setUserInfo: () => {},
  chat: null,
  pushStream: null,
  setPushStream: () => {},
  streamMessage: null,
  setStreamMessage: () => {},
  activeChat: null,
  setActiveChat: () => {},
  chatSearch: "",
  setChatSearch: () => {},
  activeChatTab: CHAT_TYPE.ALL,
  setActiveChatTab: () => {},
};

export const AppContext = createContext<IAppContext>(initialAppContext);
