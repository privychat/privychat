import React from "react";
import {FrameDetails, IFrame} from "@/app/types";
import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {Button} from "@/components/ui/button";
import * as openpgp from "openpgp";
import * as protobuf from "protobufjs";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getTimeFormatted = (ts: number) => {
  if (!ts) return;
  const date = new Date(ts);
  const today = new Date();

  const isToday =
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return `${date.getDate().toString().padStart(2, "0")}/${date
    .getMonth()
    .toString()
    .padStart(2, "0")}`;
};

export function containsLink(message: string): boolean {
  const urlPattern = new RegExp(
    "https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,}",
    "i"
  );
  return urlPattern.test(message);
}

export function extractLinks(message: string): string[] {
  const urlPattern = /https?:\/\/\S+|www\.\S+/gi;
  const matches = message.match(urlPattern);
  return matches || [];
}

export function replaceLinks(message: string): JSX.Element {
  const urlPattern = /https?:\/\/\S+|www\.\S+/gi;
  const parts = message.split(urlPattern);
  const links = message.match(urlPattern);

  return (
    <div className="font-light leading-6 text-white text-md">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && links && (
            <a
              href={links[index]}
              className="font-light leading-6 text-white hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {links[index]}
            </a>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
export function assignColorsToParticipants(
  participants: string[]
): Record<string, string> {
  const participantColors: Record<string, string> = {};
  const hueStep = 360 / participants.length;

  participants.forEach((participant, index) => {
    const hue = hueStep * index;
    const color = `hsl(${hue}, 50%, 50%)`; // Adjust saturation and lightness for readability
    participantColors[participant] = color;
  });

  return participantColors;
}
export const getFrameMetadata = async (url: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/proxy?url=${url}`
    );
    const htmlText = await response.text();

    // Load frame details
    const frameDetails: IFrame = getFormattedMetadata(url, htmlText);

    // Check validity
    if (!frameDetails.isValidFrame) {
      throw new Error("Invalid frame");
    }

    return {
      isValidFrame: true,
      frameType: frameDetails.frameType,
      frameDetails: frameDetails.frameDetails,
    };
  } catch (err) {
    console.error(err);
    return {
      isValidFrame: false,
      frameType: "unsupported",
      message: "Invalid Frame",
    };
  }
};

export function getFormattedMetadata(URL: string, data: any) {
  let frameType: string;
  const frameDetails: FrameDetails = {
    version: null,
    image: null,
    ogTitle: null,
    ogDescription: null,
    ogType: null,
    siteURL: URL,
    postURL: null,
    buttons: [],
    inputText: null,
    ogImage: null,
    state: null,
    ofProtocolIdentifier: null,
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");

  const metaElements: NodeListOf<HTMLMetaElement> =
    doc.head.querySelectorAll("meta");
  const fcTags: string[] = [];
  const ofTags: string[] = [];
  const ogTags: string[] = [];

  metaElements.forEach((element) => {
    const name =
      element.getAttribute("name") ?? element.getAttribute("property");
    switch (name) {
      case "fc:frame":
      case "fc:frame:image":
        fcTags.push(name);
        break;
      case "of:version":
      case "of:accepts:push":
      case "of:image":
        ofTags.push(name);
        break;
      case "og:image":
        ogTags.push(name);
        if (!ofTags.some((tag) => tag === "og:image")) {
          ofTags.push(name);
        }
        if (!fcTags.some((tag) => tag === "og:image")) {
          fcTags.push(name);
        }
        break;
      case "og:title":
      case "og:description":
        ogTags.push(name);
        break;
      default:
        break;
    }
  });

  if (
    ofTags.includes("of:version") &&
    ofTags.includes("of:image") &&
    ofTags.includes("of:accepts:push")
  ) {
    frameType = "of";
    metaElements.forEach((element) => {
      const name =
        element.getAttribute("name") || element.getAttribute("property");
      const content = element.getAttribute("content");
      if (name === "og:image") {
        frameDetails.ogImage = content as string;
      }
      if (name && content && name.startsWith("of:")) {
        const index = name.split(":")[2];
        switch (name) {
          case "og:title":
            frameDetails.ogTitle = content;
            break;
          case "og:description":
            frameDetails.ogDescription = content;
            break;
          case "og:type":
            frameDetails.ogType = content;
            break;
          case "of:version":
            frameDetails.version = content;
            break;
          case "of:image":
            frameDetails.image = content;
            break;
          case "of:post_url":
            frameDetails.postURL = content;
            break;
          case "of:input:text":
            frameDetails.inputText = content;
            break;
          case "of:state":
            frameDetails.state = content;
            break;
          case `of:button:${index}`:
          case `of:button:${index}:action`:
          case `of:button:${index}:target`: {
            let type: "action" | "target" | "content" = name
              .split(":")
              .pop() as "action" | "target" | "content";

            const buttonIndex = frameDetails.buttons.findIndex(
              (button) => button.index === index
            );
            if (buttonIndex !== -1) {
              if (type === index) type = "content";
              frameDetails.buttons[buttonIndex][type] = content;
            } else {
              frameDetails.buttons.push({
                index,
                content: "",
                action: "",
                target: undefined,
              });
              if (type === index) type = "content";
              frameDetails.buttons[frameDetails.buttons.length - 1][type] =
                content;
            }
            break;
          }
          default:
            break;
        }
      }
    });
  } else if (fcTags.includes("fc:frame") && fcTags.includes("fc:frame:image")) {
    frameType = "fc";

    metaElements.forEach((element) => {
      const name =
        element.getAttribute("name") || element.getAttribute("property");

      const content = element.getAttribute("content");
      if (name === "og:image") {
        frameDetails.ogImage = content as string;
      }
      if (name && content && name.startsWith("fc:frame")) {
        const index = name.split(":")[3];

        switch (name) {
          case "og:title":
            frameDetails.ogTitle = content;
            break;
          case "og:description":
            frameDetails.ogDescription = content;
            break;
          case "og:type":
            frameDetails.ogType = content;
            break;
          case "fc:frame":
            frameDetails.version = content;
            break;
          case "fc:frame:image":
            frameDetails.image = content;
            break;
          case "fc:frame:post_url":
            frameDetails.postURL = content;
            break;
          case "fc:frame:input:text":
            frameDetails.inputText = content;
            break;
          case "fc:frame:state":
            frameDetails.state = content;
            break;
          case `fc:frame:button:${index}`:
          case `fc:frame:button:${index}:action`:
          case `fc:frame:button:${index}:target`:
          case `fc:frame:button:${index}:post_url`: {
            let type: "action" | "target" | "content" | "post_url" = name
              .split(":")
              .pop() as "action" | "target" | "content";
            const buttonIndex = frameDetails.buttons.findIndex(
              (button) => button.index === index
            );
            if (buttonIndex !== -1) {
              if (type === index) type = "content";
              frameDetails.buttons[buttonIndex][type] = content;
            } else {
              frameDetails.buttons.push({
                index,
                content: "",
                action: "",
                target: undefined,
                post_url: undefined,
              });

              if (type === index) type = "content";
              frameDetails.buttons[frameDetails.buttons.length - 1][type] =
                content;
            }
            break;
          }
          default:
            break;
        }
      }
    });
  } else if (ogTags.includes("og:image")) {
    frameType = "og";
    metaElements.forEach((element) => {
      const name =
        element.getAttribute("name") || element.getAttribute("property");
      const content = element.getAttribute("content");

      if (name && content && name.startsWith("og:")) {
        switch (name) {
          case "og:image":
            frameDetails.ogImage = content as string;
            break;
          case "og:title":
            frameDetails.ogTitle = content;
            break;
          case "og:description":
            frameDetails.ogDescription = content;
            break;
          case "og:type":
            frameDetails.ogType = content;
            break;
        }
      }
    });
  } else {
    frameType = "unsupported";

    return {isValidFrame: false, frameType, message: "Not a valid Frame"};
  }
  frameDetails.buttons.sort((a, b) => parseInt(a.index) - parseInt(b.index));

  return {isValidFrame: true, frameType, frameDetails};
}

export const toSerialisedHexString = async (data: {
  url: string;
  unixTimestamp: string;
  buttonIndex: number;
  inputText: string;
  state: string;
  transactionId: string;
  address: string;
  chatId: string;
  clientProtocol: string;
  env: string;
}) => {
  const protoDefinition = `
            syntax = "proto3";

            message ChatMessage {
              string url = 1;
              string unixTimestamp = 2;
              int32 buttonIndex = 3;
              string inputText = 4;
              string state = 5;
              string transactionId = 6;
              string address = 7;
              string messageId = 8;
              string chatId = 9;
              string clientProtocol = 10;
              string env = 11;
            }
        `;

  // Load the message
  const root = protobuf.parse(protoDefinition);
  const ChatMessage = root.root.lookupType("ChatMessage");
  const chatMessage = ChatMessage.create(data);
  const binaryData = ChatMessage.encode(chatMessage).finish();
  const hexString = Buffer.from(binaryData).toString("hex");

  return hexString;
};
export const sign = async ({
  message,
  signingKey,
}: {
  message: string;
  signingKey: string;
}): Promise<any> => {
  const messageObject = await openpgp.createMessage({text: message});
  const privateKey = await openpgp.readPrivateKey({armoredKey: signingKey});
  const signature = await openpgp.sign({
    message: messageObject,
    signingKeys: privateKey,
    detached: true,
  });
  return signature;
};

export function extractBase64Image(message: string): string | null {
  const base64Regex = /data:image\/[a-zA-Z]*;base64,([^\"]*)/;
  const match = message.match(base64Regex);

  if (match && match.length > 1) {
    return match[1];
  } else {
    return null;
  }
}
