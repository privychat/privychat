import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import {removeUserKeys, trimAddress} from "@/lib/utils";
import Image from "next/image";
import React from "react";
import {useDisconnect, useEnsName} from "wagmi";
import {EllipsisVertical} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useLogout} from "@privy-io/react-auth";
import {IChat} from "@/types";

const UserInfoCard = () => {
  const {
    userInfo,
    setAccount,
    setActiveChat,
    setPushStream,
    setUserInfo,
    chat,
  } = useAppContext();
  const {setFeedContent, setFeeds, setRequests} = chat as IChat;
  const {data: ensName} = useEnsName({
    address: userInfo?.did.slice(7)! as `0x${string}`,
  });

  const {disconnect} = useDisconnect();
  const {setIsUserAuthenticated, setPushUser} = useAppContext();
  const {logout} = useLogout({
    onSuccess: () => {
      disconnect();
      removeUserKeys();
      setPushUser(null);
      setIsUserAuthenticated(false);
      setUserInfo(null);
      setAccount(null);
      setFeedContent({});
      setFeeds(null);
      setRequests(null);
      setActiveChat(null);
      setPushStream(null);
    },
  });
  return (
    <div className="rounded-md h-16 bg-black/80 border-[1px] border-gray-500 border-opacity-50  flex flex-row gap-2 items-center px-4">
      <Image
        src={userInfo?.profile.picture || DEFAULT_PFP}
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col gap-2 flex-1">
        <p className="text-sm font-medium leading-none">You</p>
        <p className="text-xs text-muted-foreground">
          {ensName ?? trimAddress(userInfo?.did.slice(7)!)}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-gray-700">
          <DropdownMenuLabel
            onClick={logout}
            className="cursor-pointer font-light text-sm"
          >
            Logout
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserInfoCard;
