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
    <div className="rounded-md h-20 bg-black border-[1px] border-gray-500 border-opacity-50  flex flex-row gap-2 items-center px-4">
      <Image
        src={userInfo?.profile.picture || DEFAULT_PFP}
        alt="avatar"
        width={60}
        height={60}
        className="rounded-full w-14 h-14"
      />
      <div className="flex flex-col ">
        <p className="text-md font-medium">You</p>
        <p className="text-sm font-light">
          {ensName ?? trimAddress(userInfo?.did.slice(7)!)}
        </p>
      </div>
    </div>
  );
};

export default UserInfoCard;
