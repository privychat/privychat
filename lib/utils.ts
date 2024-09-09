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

function convertUnixTimestamp(
  unixTimestamp: number,
  returnDay?: boolean
): string | boolean {
  const currentDate = new Date();
  const timestampDate = new Date(unixTimestamp);

  if (isNaN(timestampDate.getTime())) {
    return false;
  }

  // Compare year, month, and day
  const isSameDay =
    currentDate.getFullYear() === timestampDate.getFullYear() &&
    currentDate.getMonth() === timestampDate.getMonth() &&
    currentDate.getDate() === timestampDate.getDate();

  if (isSameDay) {
    if (returnDay) {
      return "Today";
    } else {
      return convertUnixTimestampToHHMM(unixTimestamp); // Show HH:MM for current day
    }
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
function convertUnixTimestampToHHMM(unixTimestamp: number) {
  const date = new Date(unixTimestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function assignColorsToParticipants(
  participants: string[]
): Record<string, string> {
  const participantColors: Record<string, string> = {};
  const hueStep = 360 / participants.length;

  participants.forEach((participant, index) => {
    const hue = hueStep * index;
    const color = `hsl(${hue}, 50%, 70%)`;
    participantColors[participant] = color;
  });

  return participantColors;
}

const playNotification = () => {
  const audio = new Audio("/notification.mp3");
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch((error) => console.error(error));
  }
};
export {
  cn,
  saveUserKeys,
  getUserKeys,
  removeUserKeys,
  trimAddress,
  convertUnixTimestamp,
  convertUnixTimestampToHHMM,
  assignColorsToParticipants,
  playNotification,
};
