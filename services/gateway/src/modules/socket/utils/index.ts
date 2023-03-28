import { BroadcastClientCheck } from "../types";

export * from "./socket-data-handler";

export const broadcastSameChatChannelId = (chatChannelId: string): BroadcastClientCheck => {
  return (info) => info.config.discordChatChannelId === chatChannelId;
};
