import React, {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "../ui/separator";

const MessageReactionsOverlayContainer = ({
  messageReactions,
  self,
}: {
  messageReactions: any[];
  self: boolean;
}) => {
  const [showReactionsDetails, setShowReactionsDetails] = useState(false);
  const uniqueReactions = messageReactions?.reduce(
    (uniqueReactions, reaction) => {
      if (!uniqueReactions.includes(reaction.messageContent)) {
        uniqueReactions.push(reaction.messageContent);
      }
      return uniqueReactions;
    },
    []
  );
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById("reaction-container");
      const reactDiv = document.getElementById("react-div");
      if (
        container &&
        reactDiv &&
        !container.contains(event.target as Node) &&
        !reactDiv.contains(event.target as Node)
      ) {
        setShowReactionsDetails(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div
      className={`absolute bg-secondary rounded-full  px-3 py-1 flex flex-row gap-2 ${
        self ? "bottom-[-20px] right-2" : "bottom-[-20px] left-2"
      }`}
    >
      <div
        onClick={() => {
          setShowReactionsDetails(!showReactionsDetails);
        }}
        id="react-div"
        className="cursor-pointer flex flex-row items-center gap-2"
      >
        {uniqueReactions.map((reaction: any) => (
          <div key={reaction.reaction} className="flex flex-row items-center">
            <span className="text-muted-foreground text-md">{reaction}</span>
          </div>
        ))}
        {messageReactions.length - uniqueReactions.length > 0 && (
          <div className="flex flex-row items-center">
            <span className="text-muted-foreground text-sm text-white">
              + {messageReactions.length - uniqueReactions.length}
            </span>
          </div>
        )}
      </div>

      {showReactionsDetails &&
        messageReactions &&
        messageReactions.length > 0 && (
          <div
            id="reaction-container"
            className="absolute z-10 top-[35px] left-1 flex flex-row bg-secondary rounded-md shadow-2xl backdrop-filter backdrop-blur-2xl transition-all duration-300"
          >
            {" "}
            <div>
              <Tabs defaultValue="all" className="w-[250px]">
                <TabsList className="m-2">
                  <TabsTrigger value="all" className=" px-4 py-2">
                    All
                  </TabsTrigger>

                  {uniqueReactions.map((reaction: any, index: number) => (
                    <TabsTrigger
                      key={index}
                      value={reaction}
                      className=" px-4 py-2"
                    >
                      {reaction}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Separator className="bg-gray-600 w-[90%] m-auto" />

                <TabsContent value="all">
                  <div className="py-4 px-3">
                    {messageReactions.map((reaction) => (
                      <div
                        key={reaction.cid}
                        className="flex flex-row gap-4 items-center px-1 py-2 "
                      >
                        <span className="text-muted-foreground text-md">
                          {reaction.messageContent}
                        </span>
                        <span>
                          {reaction.fromDID.slice(7, 13)}...
                          {reaction.fromDID.slice(-4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                {uniqueReactions.map((UniqueReaction: any, index: number) => {
                  return (
                    <TabsContent key={index} value={UniqueReaction}>
                      <div className="py-4 px-3">
                        {messageReactions
                          .filter(
                            (reaction) =>
                              reaction.messageContent == UniqueReaction
                          )

                          .map((reaction) => {
                            return (
                              <div
                                key={reaction.cid}
                                className="flex flex-row gap-4  px-1 py-2 items-center "
                              >
                                <span>
                                  {reaction.fromDID.slice(7, 13)}...
                                  {reaction.fromDID.slice(-4)}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </div>
        )}
    </div>
  );
};
export default MessageReactionsOverlayContainer;
