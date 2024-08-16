import {FrameDetails, IFrame, IFrameButton} from "@/app/types";
import {
  getFormattedMetadata,
  getTimeFormatted,
  replaceLinks,
  sign,
  toSerialisedHexString,
} from "@/lib/utils";
import {LightningBoltIcon} from "@radix-ui/react-icons";
import {Bell} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import {Button} from "./button";
import {toast} from "./use-toast";
import {
  useAccount,
  useChainId,
  useEnsName,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import {usePushUser} from "@/providers/push-provider";
import {Input} from "./input";
import {IUser} from "@pushprotocol/restapi";
interface FrameRendererProps {
  frameDetails: FrameDetails;
  messageMeta: {
    message: string;
    self: boolean;
    timestamp: number;
  };
  isGroup?: boolean;
  sender?: string;
  color?: string;
}
const FrameRenderer: React.FC<FrameRendererProps> = ({
  frameDetails,
  messageMeta,
  isGroup,
  sender,
  color,
}) => {
  const {address} = useAccount();
  const {pushUser} = usePushUser();
  const chainId = useChainId();
  const {switchChain} = useSwitchChain();
  const {sendTransactionAsync} = useSendTransaction();
  const [inputText, setInputText] = useState("");
  const [frameData, setFrameData] = useState<FrameDetails>(frameDetails);
  const [frameLoading, setFrameLoading] = useState(false);

  const {data: ensName} = useEnsName({
    address: sender as `0x${string}`,
  });
  const formattedTime = new Date(
    messageMeta.timestamp * 1000
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const [user, setUser] = useState<IUser | undefined>();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = await pushUser?.info({
        overrideAccount: sender,
      });
      setUser(user);
    };
    fetchUserInfo();
  }, [sender]);
  // Function to trigger a transaction

  const TriggerTx = async (data: any) => {
    if (!data || !data.params || !data.chainId) {
      toast({
        title: "Error",
        description: "Invalid data",
      });
      return {status: "failure", message: "Invalid data"};
    }
    if (!address) {
      toast({
        title: "Error",
        description: "Wallet not connected",
      });
      return {status: "failure", message: "Wallet not connected"};
    }

    const requestedChainId = data.chainId.split(":")[1];
    if (Number(requestedChainId) !== Number(chainId)) {
      await switchChain({
        chainId: Number(requestedChainId),
      });
    }
    let hash = undefined;

    try {
      hash = await sendTransactionAsync({
        account: address,
        chainId: Number(data.chainId.slice(7)),
        to: data.params.to as `0x${string}`,
        value: data.params.value,
        data: (data.params.data as any) ?? undefined,
      });
    } catch (error) {
      return {
        hash: "Failed",
        status: "failure",
        message: error ?? "Failed",
      };
    }

    return {hash, status: "success", message: "Transaction sent"};
  };
  const onButtonClick = async (button: IFrameButton) => {
    if (!frameData) return;
    setFrameLoading(true);
    if (button.action === "mint") {
      toast({
        title: "Error",
        description: "Mint Action is not supported",
      });
      setFrameLoading(false);
      return;
    }
    let hash;

    const serializedProtoMessage = await toSerialisedHexString({
      url: frameData.siteURL as string,
      unixTimestamp: Date.now().toString(),
      buttonIndex: Number(button.index),
      inputText: frameData?.inputText ? inputText : "undefined",
      state: frameData?.state ?? "",
      transactionId: hash ?? "",
      address: address as `0x${string}`,
      chatId: window.location.href.split("/").pop() ?? "null",
      clientProtocol: "privy",
      env: "PROD",
    });
    const signedMessage = await sign({
      message: serializedProtoMessage,
      signingKey: pushUser?.decryptedPgpPvtKey!,
    });

    // If the button action is post_redirect or link, opens the link in a new tab
    if (button.action === "post_redirect" || button.action === "link") {
      window.open(button.target!, "_blank");
      setFrameLoading(false);
      return;
    }

    // If the button action is tx, triggers a transaction and then makes a POST call to the Frame server
    if (button.action === "tx" && button.target) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/proxy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: window.location.origin,
          },
          body: JSON.stringify({
            url: button.target,
            data: {
              clientProtocol: "push",
              untrustedData: {
                url: frameData.siteURL,
                unixTimestamp: Date.now().toString(),
                buttonIndex: Number(button.index),
                inputText: frameData?.inputText ? inputText : "undefined",
                state: frameData?.state ?? "",
                transactionId: hash ?? "",
                address,
                chatId: window.location.href.split("/").pop() ?? "null",
                clientProtocol: "privy",
                env: "PROD",
              },
              trustedData: {
                messageBytes: serializedProtoMessage,
                pgpSignature: signedMessage,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        setFrameLoading(false);
        return;
      }

      const data = await response.json();
      const {hash: txid, status} = await TriggerTx(data);
      hash = txid;

      if (!txid || status === "failure") {
        toast({
          title: "Error",
          description: "Transaction failed",
          variant: "destructive",
        });
        setFrameLoading(false);
        return;
      }
    }

    // Makes a POST call to the Frame server after the action has been performed

    let post_url = button.post_url ?? frameData?.postURL ?? frameData?.siteURL;

    if (button.action === "post") {
      post_url =
        button.target ??
        button.post_url ??
        frameData?.postURL ??
        frameData?.siteURL;
    }
    if (!post_url) return;
    const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/proxy/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
      },
      body: JSON.stringify({
        url: post_url,
        data: {
          clientProtocol: "push",
          untrustedData: {
            url: frameData.siteURL,
            unixTimestamp: Date.now().toString(),
            buttonIndex: Number(button.index),
            inputText: frameData?.inputText ? inputText : "undefined",
            state: frameData?.state ?? "",
            transactionId: hash ?? "",
            address,

            chatId: window.location.href.split("/").pop() ?? "null",
            clientProtocol: "privy",
            env: "PROD",
          },
          trustedData: {
            messageBytes: serializedProtoMessage,
            pgpSignature: signedMessage,
          },
        },
      }),
    });

    const data = await response.text();

    const frameResponse: IFrame = getFormattedMetadata(
      frameData.siteURL!,
      data
    );
    setInputText("");

    setFrameData(frameResponse.frameDetails!);
    setFrameLoading(false);
  };

  return (
    <div
      className={`flex flex-col gap-2 ${
        messageMeta.self ? "items-end mr-2" : "items-start ml-2"
      }`}
    >
      <div
        className={`max-w-lg size-84 flex flex-col gap-2 justify-center border-1 rounded-xl bg-white relative`} // Added relative here for positioning overlay
      >
        {frameLoading && (
          <div className="absolute inset-0 bg-gray-300 flex justify-center items-center z-10 animate-pulse-opacity rounded-xl"></div>
        )}
        <Link
          href={frameData?.siteURL || frameData?.postURL || ""}
          target="blank"
        >
          <Image
            src={frameData.image!}
            alt="Meta Image"
            width={1528}
            height={800}
            className="rounded-t-xl"
          />
        </Link>
        {frameData?.inputText && (
          <div className="w-[95%] m-auto">
            <Input
              type="text"
              className="input w-full border-primary text-primary rounded-lg"
              placeholder={frameData.inputText}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        )}
        <div className="flex flex-row justify-between gap-2 items-center w-[95%] m-auto">
          {frameData?.buttons?.map((button) => (
            <Button
              key={button.index}
              className={`btn btn-primary flex-shrink-0`} // Ensure buttons don't shrink
              style={{width: `${100 / frameData?.buttons.length - 1}%`}} // Set dynamic width
              onClick={(e) => {
                e.preventDefault();
                onButtonClick(button);
              }}
            >
              {button.content} {button.action === "tx" && <LightningBoltIcon />}{" "}
              {button.action === "link" && "🔗"}
              {button.action === "post_redirect" && "🔗"}
              {button.action?.includes("subscribe") && <Bell />}
              {button.action === "mint" && "💰"}
            </Button>
          ))}
        </div>
        <div className="flex justify-end mr-4 mb-2">
          <a
            href={frameData.siteURL!}
            target="blank"
            className="text-black/60 text"
          >
            {new URL(frameData.siteURL!).hostname}
          </a>
        </div>
      </div>
      <div
        className={`relative p-3 px-4 ${
          messageMeta.self ? "bg-primary" : "bg-secondary"
        } rounded-lg w-[fit-content] max-w-[50%]`}
      >
        {isGroup && !messageMeta.self && (
          <p
            className={`font-semibold mb-1`}
            style={{
              color: `${color}`,
            }}
          >
            {ensName ??
              (user?.profile.name
                ? `~ ${user.profile.name} (${sender?.slice(
                    0,
                    6
                  )}...${sender?.slice(-4)})`
                : `${sender?.slice(0, 6)}...${sender?.slice(-4)}`)}
          </p>
        )}
        <div className="flex flex-row my-1">
          <div className="font-light leading-6 text-white ">
            {replaceLinks(messageMeta.message)}
          </div>
          <div className="relative w-20">
            <span
              className={`align-right absolute bottom-0 right-0  text-muted-foreground text-sm ${
                messageMeta.self && "text-white"
              }`}
            >
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameRenderer;
