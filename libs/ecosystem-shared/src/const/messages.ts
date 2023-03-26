/* api */
export const API_GET_RECORDS_CMD = "getRecords";
export type ApiGetRecordsMessagePayload = {
  map?: string;
  track?: number;
  style?: number;
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
export type DiscordCommonWebhookActionPayload = {
  url: string;
  serverId: string;
};

export const DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD = "sendGameChatMessageWebhook";
export type DiscordSendGameChatMessagePayload = DiscordCommonWebhookActionPayload & {
  authId: string;
  name: string;
  message: string;
};

export const DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD = "sendPlayerConnectMessageWebhook";
export type DiscordSendPlayerConnectMessagePayload = DiscordCommonWebhookActionPayload & {
  authId: string;
  name: string;
};

export const DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD = "sendPlayerDisonnectMessageWebhook";
export type DiscordSendPlayerDisconnectMessagePayload = DiscordCommonWebhookActionPayload & {
  authId: string;
  name: string;
  reason: string;
};

export const DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD = "sendMapChangeMessageWebhook";
export type DiscordSendMapChangeMessagePayload = DiscordCommonWebhookActionPayload & {
  mapName: string;
};

export const DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD = "sendRecordNotificationWebhook";
export type DiscordSendRecordNotificationPayload = DiscordCommonWebhookActionPayload & {
  playerName1: string;
  playerName2: string;
  mapName: string;
  time: number;
  oldWR: number;
  track: number;
  style: number;
};

export const DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD = "sendAnticheatNotificationWebhook";
export type DiscordSendAnticheatNotificationPayload = DiscordCommonWebhookActionPayload & {
  authId: string;
  playerName: string;
  mapName: string;
  track: number;
  style: number;
  message: string;
};
