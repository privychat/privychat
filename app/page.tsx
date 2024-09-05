"use client";
import {Button} from "@/components/ui/button";
import {ThemeToggleSwitch} from "@/components/ui/theme-toggle-switch";
import {useAppContext} from "@/hooks/use-app-context";
import {removeUserKeys} from "@/lib/utils";
import {useLogout, usePrivy} from "@privy-io/react-auth";
import Image from "next/image";
import {useDisconnect, useWalletClient} from "wagmi";
import usePush from "../hooks/use-push";
import {useEffect} from "react";
import SignUpModal from "@/components/sign-up-modal";
import FullPageLoader from "@/components/full-page-loader";
import Navbar from "@/components/ui/navbar";
import HeroSection from "@/components/ui/hero-section";
import ChatWindow from "@/components/chat-window";

export default function Home() {
  const {data: signer} = useWalletClient();
  const {login, user, authenticated, ready} = usePrivy();

  const {isUserAuthenticated, pushUser, setIsUserAuthenticated, setPushUser} =
    useAppContext();

  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center">
      {signer && !pushUser && <SignUpModal />}
      {!pushUser && <HeroSection />}
      {pushUser && <ChatWindow />}
      {!ready && <FullPageLoader />}
    </main>
  );
}
