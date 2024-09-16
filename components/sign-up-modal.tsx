import {useAppContext} from "@/hooks/use-app-context";
import {usePrivy} from "@privy-io/react-auth";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "./ui/button";

const SignUpModal = () => {
  const {initializePushUser} = useAppContext();

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 bg-blur-lg bg-backdrop z-100">
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
          <Button onClick={initializePushUser} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default SignUpModal;
