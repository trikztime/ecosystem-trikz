import { EncryptedData } from "../types";
import {
  AnticheatNotificationEventPayload,
  ChatMessageEventPayload,
  ExecuteRconCommandEventPayload,
  MapChangeEventPayload,
  PlayerConnectEventPayload,
  PlayerDisconnectEventPayload,
  RecordEventPayload,
} from "./socketEvents";

/* отправка события в дискорд через вебхук */
type DiscordWebhookEventPayload<T> = {
  discordData: {
    url: EncryptedData;
    channelId: string;
    serverId: string;
  };
  eventData: T;
};

/* получение события из канала дискорда */
type DiscordChannelEventPayload<T> = {
  discordData: {
    channelId: string;
  };
  eventData: T;
};

/* gateway socket */
export const GATEWAY_SOCKET_BROADCAST_DISCORD_CHAT_MESSAGE_EVENT_CMD = "socketBroadcastDiscordChatMessageEvent";
export type GatewaySocketBroadcastChatMessageEventPayload = DiscordChannelEventPayload<ChatMessageEventPayload>;

export const GATEWAY_SOCKET_EXECUTE_RCON_COMMAND_EVENT_CMD = "socketExecuteRconCommandEvent";
export type GatewaySocketExecuteRconCommandEventPayload = DiscordChannelEventPayload<ExecuteRconCommandEventPayload>;

/* api */
export const API_GET_RECORDS_CMD = "getRecords";
export type ApiGetRecordsMessagePayload = {
  map?: string;
  track?: number;
  style?: number;
  authId?: number;
};

export const API_GET_MAPS_CMD = "getMaps";
export type ApiGetMapsMessagePayload = null;

export const API_GET_MAP_BY_NAME_CMD = "getMapByName";
export type ApiGetMapByNameMessagePayload = {
  name: string;
};

/* skillrank */
export const SKILLRANK_RECALCULATE_ALL_CMD = "recalculateAll";
export type SkillrankRecalculateAllPayload = null;

export const SKILLRANK_RECALCULATE_MAP_CMD = "recalculateMap";
export type SkillrankRecalculateMapPayload = {
  map: string;
  style: number;
};

/* discord */
export const DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD = "sendGameChatMessageWebhook";
export type DiscordSendGameChatMessagePayload = DiscordWebhookEventPayload<ChatMessageEventPayload>;

export const DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD = "sendPlayerConnectMessageWebhook";
export type DiscordSendPlayerConnectMessagePayload = DiscordWebhookEventPayload<PlayerConnectEventPayload>;

export const DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD = "sendPlayerDisonnectMessageWebhook";
export type DiscordSendPlayerDisconnectMessagePayload = DiscordWebhookEventPayload<PlayerDisconnectEventPayload>;

export const DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD = "sendMapChangeMessageWebhook";
export type DiscordSendMapChangeMessagePayload = DiscordWebhookEventPayload<MapChangeEventPayload>;

export const DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD = "sendAnticheatNotificationWebhook";
export type DiscordSendAnticheatNotificationPayload = DiscordWebhookEventPayload<AnticheatNotificationEventPayload>;

export const DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD = "sendRecordNotificationWebhook";
export type DiscordSendRecordNotificationPayload = DiscordWebhookEventPayload<RecordEventPayload>;

export const DISCORD_SEND_EXECUTED_RCON_COMMAND_WEBHOOK_CMD = "sendExecutedRconCommandWebhook";
export type DiscordSendExecutedRconCommandPayload = DiscordWebhookEventPayload<ExecuteRconCommandEventPayload>;
