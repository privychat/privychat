const DEFAULT_PFP =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA1UlEQVR4AcXBMUoFMRCA4f8NU+QkOYr9dNruIUS2N4jgFdJa5i6WU3uILQLPdtgisDxkvu/29ft8Z8FcecSokxUhmZBMSKacmCsro05WzJXIXIlGnURCMiGZkEzNlSvMlUeYK5GQTEgmJFNOvj9eiUpvPOLYdqKXt08iIZmQTEh2e3/6uROU3vhPx7YTCcmEZEIyLb1xxbHtrJTeWCm9EQnJhGRCMuXEXIlGnUSlN64wV6JRJ5GQTEgmJFNzJRp1Epkr0aiTFXMlGnUSmSuRkExIJiT7A+3GMx5oCAQQAAAAAElFTkSuQmCC";
enum CHAT_TYPE {
  ALL = "all",
  REQUESTS = "requests",
  PINNED = "pinned",
  ARCHIVED = "archived",
  GROUPS = "groups",
}
enum MESSAGE_TYPE {
  TEXT = "Text",
  IMAGE = "Image",
  REACTION = "Reaction",
  GIF = "GIF",
  REPLY = "Reply",
}

enum CHAT_SIDE {
  CHATS = "CHATS",
  REQUESTS = "REQUESTS",
}

const SUPPORTED_DOMAINS = [
  "eth",
  "x",
  "polygon",
  "pudgy",
  "nft",
  "crypto",
  "blockchain",
  "bitcoin",
  "dao",
  "888",
  "wallet",
  "binanceus",
  "hi",
  "klever",
  "kresus",
  "anime",
  "manga",
  "go",
  "zil",
];

enum STREAM_SOURCE {
  INTERNAL = "internal",
  SELF = "self",
  OTHERS = "other",
}

export {
  DEFAULT_PFP,
  CHAT_TYPE,
  MESSAGE_TYPE,
  SUPPORTED_DOMAINS,
  STREAM_SOURCE,
  CHAT_SIDE,
};
