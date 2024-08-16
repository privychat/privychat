"use client";
import {Button} from "@/components/ui/button";
import {usePrivy} from "@privy-io/react-auth";
import Navbar from "@/components/ui/navbar";
import {useWalletClient} from "wagmi";
import ChatsPage from "./chat/page";
import {usePushUser} from "@/providers/push-provider";

export default function Home() {
  const {login, authenticated, ready} = usePrivy();
  const {data: signer} = useWalletClient();
  const {pushUser} = usePushUser();

  return (
    <main>
      {!pushUser && ready && !authenticated && (
        <div>
          <Navbar />
          <section className="flex flex-col gap-4 justify-center items-center  min-h-[80vh] w-[90vw] m-auto">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              gm anon!
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
              Start texting your friends or send a message to vitalik.eth
            </p>
            <Button
              onClick={() => login()}
              variant={"default"}
              disabled={authenticated || !ready}
            >
              Login
            </Button>
          </section>
        </div>
      )}

      {pushUser && <ChatsPage />}
    </main>
  );
}
