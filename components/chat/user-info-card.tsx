import {DEFAULT_PFP} from "@/constants";
import {useAppContext} from "@/hooks/use-app-context";
import {trimAddress} from "@/lib/utils";
import Image from "next/image";
import React from "react";
import {useEnsName} from "wagmi";

const UserInfoCard = () => {
  const {userInfo} = useAppContext();
  const {data: ensName} = useEnsName({
    address: userInfo?.did.slice(7)! as `0x${string}`,
  });
  return (
    <div className="rounded-md h-20 bg-black/80 border-[1px] border-gray-500 border-opacity-50  flex flex-row gap-2 items-center px-4">
      <Image
        src={userInfo?.profile.picture || DEFAULT_PFP}
        alt="avatar"
        width={50}
        height={50}
        className="rounded-full w-12 h-12"
      />
      <div className="flex flex-col gap-2">
        <p className="text-md font-medium leading-none">You</p>
        <p className="text-sm text-muted-foreground">
          {ensName ?? trimAddress(userInfo?.did.slice(7)!)}
        </p>
      </div>
    </div>
  );
};

export default UserInfoCard;
