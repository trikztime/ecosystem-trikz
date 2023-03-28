export enum SocketEventKeys {
  HANDSHAKE = "handshake",
  CHAT_MESSAGE = "chatMessage",
  PLAYER_CONNECT = "playerConnect",
  PLAYER_DISCONNECT = "playerDisconnect",
  MAP_CHANGE = "mapChange",
  ANTICHEAT_NOTIFICATION = "anticheatNotification",
  RECORD_NOTIFICATION = "recordNotification",
}

export const SocketEventCodes: Record<SocketEventKeys, number> = {
  handshake: 1,
  chatMessage: 2,
  playerConnect: 3,
  playerDisconnect: 4,
  mapChange: 5,
  anticheatNotification: 6,
  recordNotification: 7,
};

export type HandshakeEventPayload = {
  id: string;
};

export type ChatMessageEventPayload = {
  source: number;
  name: string;
  message: string;
  authId: string;
  prefix?: string;
  nameColor?: string;
};

export type PlayerConnectEventPayload = {
  name: string;
  authId: string;
};

export type PlayerDisconnectEventPayload = {
  name: string;
  authId: string;
  reason: string;
};

export type MapChangeEventPayload = {
  name: string;
};

export type AnticheatNotificationEventPayload = {
  authId: string;
  name: string;
  map: string;
  track: number;
  message: string;
};

export type RecordNotificationEventPayload = {
  name1: string;
  name2: string;
  map: string;
  time: number;
  oldWR: number;
  track: number;
  style: number;
};
