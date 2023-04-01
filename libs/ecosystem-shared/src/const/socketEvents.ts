export enum SocketEventKeys {
  HANDSHAKE = "handshake",
  CHAT_MESSAGE = "chatMessage",
  PLAYER_CONNECT = "playerConnect",
  PLAYER_DISCONNECT = "playerDisconnect",
  MAP_CHANGE = "mapChange",
  ANTICHEAT_NOTIFICATION = "anticheatNotification",
  RECORD = "record",
  EXECUTE_RCON_COMMAND = "executeRconCommand",
}

export const SocketEventCodes: Record<SocketEventKeys, number> = {
  handshake: 1,
  chatMessage: 2,
  playerConnect: 3,
  playerDisconnect: 4,
  mapChange: 5,
  anticheatNotification: 6,
  record: 7,
  executeRconCommand: 8,
};

export enum ChatMessageSourceKeys {
  DISCORD = "discord",
  SERVER = "server",
}

export const ChatMessageSourceCodes: Record<ChatMessageSourceKeys, number> = {
  discord: 1,
  server: 2,
};

export type HandshakeEventPayload = {
  id: string;
};

export type ChatMessageEventPayload = {
  source: number;
  name: string;
  message: string;
  authId?: string;
  authId3?: number;
  prefix?: string;
  nameColor?: string;
};

export type PlayerConnectEventPayload = {
  serverId: string;
  name: string;
  authId: string;
  authId3: number;
};

export type PlayerDisconnectEventPayload = {
  serverId: string;
  name: string;
  authId: string;
  authId3: number;
  reason: string;
};

export type MapChangeEventPayload = {
  serverId: string;
  name: string;
};

export type AnticheatNotificationEventPayload = {
  serverId: string;
  authId: string;
  name: string;
  map: string;
  track: number;
  message: string;
};

export type RecordEventPayload = {
  serverId: string;
  position: number;
  name1: string;
  name2: string;
  map: string;
  time: number;
  oldWR: number;
  track: number;
  style: number;
};

export type ExecuteRconCommandEventPayload = {
  channelId: string;
  request?: string;
  response?: string;
};
