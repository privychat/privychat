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

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function extractWebLinks(message: string | object): string[] {
  if (typeof message !== "string") {
    return [];
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = message.match(urlRegex);
  return matches ? matches : [];
}

function searchObjectValues<T>(
  obj: Record<string, T>,
  searchString: string,
  caseSensitive: boolean = false
): Record<string, T> {
  // Convert search string to lowercase if case-insensitive
  const searchTerm = caseSensitive ? searchString : searchString.toLowerCase();

  // Use Object.entries() to get an array of [key, value] pairs, then filter and reduce
  return Object.entries(obj).reduce(
    (result: Record<string, T>, [key, value]) => {
      // Convert value to string and to lowercase if case-insensitive
      const strValue = String(value);
      const compareValue = caseSensitive ? strValue : strValue.toLowerCase();

      // Check if the value includes the search term
      if (compareValue.includes(searchTerm)) {
        result[key] = value;
      }
      return result;
    },
    {}
  );
}

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
  generateRandomString,
  extractWebLinks,
  searchObjectValues,
};
