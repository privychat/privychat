import {CHAT_TYPE} from "@/constants";
import {IAppContext} from "@/types";
import {createContext} from "react";

export const AppContext = createContext<IAppContext>({} as IAppContext);
