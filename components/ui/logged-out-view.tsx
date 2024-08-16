import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {usePrivy} from "@privy-io/react-auth";
import {useWalletClient} from "wagmi";
import {Button} from "./button";
import {usePushUser} from "@/providers/push-provider";

const LoggedOutView = () => {
  const {authenticated, ready, login} = usePrivy();
  const {pushUser} = usePushUser();
  return (
    <>
      {!pushUser && ready && !authenticated && (
        <div className="h-screen w-screen fixed inset-0 bg flex items-center justify-center backdrop-filter backdrop-blur-lg z-20">
          <Card className="flex flex-col items-center justify-center shadow-xl p-8">
            <CardHeader>
              <CardTitle className="text-lg">
                Aha, Can you identify yourself?
              </CardTitle>
              <CardDescription className="text-center">
                Login to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled={!ready} onClick={login} className="">
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoggedOutView;
