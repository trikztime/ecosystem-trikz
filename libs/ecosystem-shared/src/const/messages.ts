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
export const API_GET_RECORDS_LIST_CMD = "getRecordsList";
export type ApiGetRecordsListMessagePayload = {
  map?: string;
  track?: number;
  style?: number;
  authId?: number;
};
export const API_GET_RECORD_DETAILS_CMD = "getRecordDetails";
export type ApiGetRecordDetailsMessagePayload = {
  id: number;
};

export const API_GET_MAP_BEST_TIMES_CMD = "getMapBestTimes";
export type ApiGetMapBestTimesPayload = null;

export const API_GET_MAPS_LIST_CMD = "getMapsList";
export type ApiGetMapsListMessagePayload = null;

export const API_GET_MAP_BY_NAME_CMD = "getMapByName";
export type ApiGetMapByNameMessagePayload = {
  name: string;
};

export const API_GET_PLAYERS_LIST_CMD = "getPlayersList";
export type ApiGetPlayersListMessagePayload = null;

export const API_GET_PLAYER_BY_AUTH_CMD = "getPlayerByAuth";
export type ApiGetPlayerByAuthMessagePayload = {
  authId: number;
};

/* skillrank */
export const SKILLRANK_RECALCULATE_ALL_CMD = "recalculateAll";
export type SkillrankRecalculateAllPayload = null;

export const SKILLRANK_RECALCULATE_MAP_CMD = "recalculateMap";
export type SkillrankRecalculateMapPayload = {
  map: string;
  style: number;
};

export const SKILLRANK_GET_RECORD_GROUP_CMD = "getRecordGroup";
export type SkillrankGetRecordGroupPayload = {
  totalRecords: number;
  position: number;
};

export const SKILLRANK_GET_RECORD_POINTS_CMD = "getRecordPoints";
export type SkillrankGetRecordPointsPayload = {
  totalRecords: number;
  position: number;
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
