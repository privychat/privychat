import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function saveUserKeys(userKey: string, userAccount: string) {
  localStorage.setItem("userKey", userKey);
  localStorage.setItem("userAccount", userAccount);
}

function getUserKeys() {
  return {
    userKey: localStorage.getItem("userKey"),
    userAccount: localStorage.getItem("userAccount"),
  };
}

function removeUserKeys() {
  localStorage.removeItem("userKey");
  localStorage.removeItem("userAccount");
}

function trimAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function convertUnixTimestamp(unixTimestamp: number): string | boolean {
  const currentDate = new Date();
  const timestampDate = new Date(unixTimestamp);
  if (isNaN(timestampDate.getTime())) {
    return false;
  }
  const diffTime = Math.abs(currentDate.getTime() - timestampDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    return timestampDate.toLocaleDateString("en-GB"); // Format as DD/MM/YY
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return timestampDate.toLocaleString("en-US", {weekday: "long"}); // Return day of the week
  }
}
export {
  cn,
  saveUserKeys,
  getUserKeys,
  removeUserKeys,
  trimAddress,
  convertUnixTimestamp,
};
