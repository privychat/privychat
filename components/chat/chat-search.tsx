import React, {useState} from "react";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import Typewriter from "typewriter-effect";
import {useAppContext} from "@/hooks/use-app-context";
const ChatSearch = () => {
  const {chatSearch, setChatSearch} = useAppContext();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <section className=" bg-black rounded-md cursor-text p-2">
      <div className="relative" onClick={() => setIsFocused(true)}>
        <Input
          className="w-full h-9 bg-secondary rounded-full text-sm z-10 pl-10"
          onChange={(e) => setChatSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={isFocused}
        />
        {chatSearch.length < 1 && !isFocused && (
          <div className="absolute w-[300px] top-1/2 left-10 transform -translate-y-1/2 z-0">
            <Typewriter
              options={{
                strings: ["vitalik.eth", "Push Alpha", "0x4e6D5959a2"],
                autoStart: true,
                loop: true,
                wrapperClassName: "text-white text-sm z-0 text-white/30",
              }}
            />
          </div>
        )}

        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 w-[20px] text-white/30" />
      </div>
    </section>
  );
};

export default ChatSearch;
