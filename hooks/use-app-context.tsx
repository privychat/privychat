import {AppContext} from "@/providers/push-provider";
import {useContext} from "react";

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
};
