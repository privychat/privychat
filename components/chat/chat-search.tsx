import React from "react";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import Typewriter from "typewriter-effect";
import {useAppContext} from "@/hooks/use-app-context";
const ChatSearch = () => {
  const {chatSearch} = useAppContext();
  return (
    <section className=" bg-black rounded-md  p-2">
      <div className="relative">
        <Input className="text-muted-foreground pl-10 text-md h-[42px]" />
        {chatSearch.length < 1 && (
          <div className="absolute w-[300px] top-1/2 left-10 transform -translate-y-1/2">
            <Typewriter
              options={{
                strings: ["vitalik.eth", "Push Alpha", "0x4e6D5959a2"],
                autoStart: true,
                loop: true,
                wrapperClassName: "text-muted-foreground",
              }}
            />
          </div>
        )}

        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 w-[20px]" />
      </div>
    </section>
  );
};

export default ChatSearch;
