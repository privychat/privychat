import Image from "next/image";
import React from "react";
import {ThemeToggleSwitch} from "./theme-toggle-switch";
import {useLogout, usePrivy} from "@privy-io/react-auth";
import {Button} from "./button";
import {removeUserKeys} from "@/lib/utils";
import {useDisconnect} from "wagmi";
import {useAppContext} from "@/hooks/use-app-context";

const Navbar = () => {
  const {authenticated} = usePrivy();

  const {disconnect} = useDisconnect();
  const {isUserAuthenticated, pushUser, setIsUserAuthenticated, setPushUser} =
    useAppContext();
  const {logout} = useLogout({
    onSuccess: () => {
      disconnect();
      removeUserKeys();
      setPushUser(null);
      setIsUserAuthenticated(false);
    },
  });
  return (
    <nav className="w-full flex flex-row justify-between items-center p-6">
      <Image src="/logo.png" alt="logo" width={100} height={100} />
      <div className="flex flex-row gap-2">
        <ThemeToggleSwitch />
        {authenticated && (
          <Button onClick={logout} variant={"secondary"}>
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
