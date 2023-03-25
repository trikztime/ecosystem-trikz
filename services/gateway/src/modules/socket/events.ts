export enum SocketEventKeys {
  HANDSHAKE = "handshake",
  CHAT_MESSAGE = "chatMessage",
  PLAYER_CONNECT = "playerConnect",
  PLAYER_DISCONNECT = "playerDisconnect",
  MAP_CHANGE = "mapChange",
  NOTIFICATION_ANTICHEAT = "notificationAnticheat",
  NOTIFICATION_RECORD = "notificationRecord",
}

export const SocketEventCodes: Record<SocketEventKeys, number> = {
  handshake: 1,
  chatMessage: 2,
  playerConnect: 3,
  playerDisconnect: 4,
  mapChange: 5,
  notificationAnticheat: 6,
  notificationRecord: 7,
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
