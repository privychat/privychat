"use client";
import React, {useEffect, useState} from "react";
import ThemeToggleSwitch from "../ui/theme-toggle-switch";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {useEnsName} from "wagmi";
import {usePushUser} from "@/providers/push-provider";
import {Skeleton} from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {usePrivy} from "@privy-io/react-auth";
import {EllipsisVertical} from "lucide-react";

const UserInfo = () => {
  const {pushUser, userInfo} = usePushUser();
  const {logout} = usePrivy();

  const {data: ensName} = useEnsName({
    address: userInfo?.did.slice(7) as `0x${string}`,
  });

  return (
    <>
      {userInfo ? (
        <div className="flex flex-row  gap-2 w-full items-center p-4 py-2 bg-gray-400/20 rounded-md">
          <Avatar className="w-[50px] h-[50px] flex items-center rounded-full">
            <AvatarImage
              src={
                userInfo?.profilePicture ??
                "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
              }
              className="w-[40px] h-[40px] rounded-full"
            />
            <AvatarFallback>user</AvatarFallback>
          </Avatar>
          <h4
            className="scroll-m-20 text-xl font-semibold tracking-tight w-[60%] flex-grow cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(`${userInfo?.did.slice(7)}`);
            }}
          >
            {ensName ??
              `${userInfo?.did.slice(7, 13)}...${userInfo?.did.slice(-4)}`}
          </h4>
          <div className="flex flex-row gap-2 items-center">
            <ThemeToggleSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    window.location.replace("/");
                    localStorage.clear();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4  p-4 py-2 bg-gray-400/20 rounded-md">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
