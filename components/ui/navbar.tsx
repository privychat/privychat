"use client";
import React from "react";
import ThemeToggleSwitch from "./theme-toggle-switch";
import Image from "next/image";
import {useTheme} from "next-themes";
import {Button} from "./button";
import {usePrivy} from "@privy-io/react-auth";

const Navbar = () => {
  const {theme} = useTheme();
  const {login, authenticated, logout} = usePrivy();
  return (
    <div className="flex flex-row justify-between p-6">
      <Image
        src={theme === "light" ? "/push_logo_dark.png" : "/push_logo_light.png"}
        alt="Logo"
        width={100}
        height={100}
      />
      <div className="flex flex-row items-center gap-4">
        <ThemeToggleSwitch />
        <Button
          variant="default"
          onClick={() => {
            if (authenticated) {
              logout();
            } else {
              login();
            }
          }}
        >
          {authenticated ? "Logout" : "Login"}
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
