import {useAppContext} from "@/hooks/use-app-context";
import {getUserKeys, saveUserKeys} from "@/lib/utils";
import {usePrivy} from "@privy-io/react-auth";
import {CONSTANTS, PushAPI} from "@pushprotocol/restapi";
import React from "react";
import {useWalletClient} from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "./ui/button";

const SignUpModal = () => {
  const {data: signer} = useWalletClient();
  const {user: privyUser, ready, authenticated} = usePrivy();
  const {
    isUserAuthenticated,
    setAccount,
    setPushUser,
    pushStream,
    setStreamMessage,
  } = useAppContext();
  const [loading, setLoading] = React.useState(false);
  const initializePushUser = async () => {
    if (isUserAuthenticated && signer) {
      try {
        setLoading(true);
        const {userAccount, userKey} = getUserKeys();

        const user = await PushAPI.initialize(signer, {
          env: CONSTANTS.ENV.PROD,
          ...(userKey && {decryptedPGPPrivateKey: userKey}),
          ...(userAccount && {account: userAccount}),
        });

        if (!user.decryptedPgpPvtKey) {
          setLoading(false);
          return;
        }
        saveUserKeys(user.decryptedPgpPvtKey!, user.account);
        setPushUser(user);
        setAccount(user.account);

        if (pushStream.current && pushStream.current.disconnected === false) {
          setLoading(false);
          return;
        }

        const stream = await user.initStream([CONSTANTS.STREAM.CHAT]);
        stream.on(CONSTANTS.STREAM.CONNECT, async (a) => {
          console.log("Stream Connected");
        });
        stream.on(CONSTANTS.STREAM.DISCONNECT, async (a) => {
          console.log("Stream Disconnected");
        });

        // Chat message received:
        stream.on(CONSTANTS.STREAM.CHAT, (message) => {
          console.log("Chat", message);
          setStreamMessage(message);
        });
        stream.on(CONSTANTS.STREAM.CHAT_OPS, (message) => {
          console.log("Chat Ops", message);
        });

        stream.connect();

        pushStream.current = stream;
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };
  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 bg-blur-lg bg-backdrop z-100">
      <Card className="flex flex-col items-center justify-center border-none w-[340px] z-100">
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl mb-2">
            Continue to PrivyChat
          </CardTitle>
          <CardDescription>
            This is a one-time step before you can use PrivyChat. You will be
            prompted to sign a message with your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <Button
            onClick={initializePushUser}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Sign in Wallet" : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default SignUpModal;
