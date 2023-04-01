import { ServerConfig } from "@trikztime/ecosystem-shared/config";
import { Socket } from "net";

export interface IDiscordChat {
  channelId: string;
  webhookId: string;
  webhookToken: string;
}

export interface ISocketClientInfo {
  socket: Socket;
  config: ServerConfig;
}

export interface ISocketEventMessage<T = unknown> {
  socket?: Socket;
  event: number;
  payload: T;
}

export type BroadcastClientCheck = (info: ISocketClientInfo) => boolean;
