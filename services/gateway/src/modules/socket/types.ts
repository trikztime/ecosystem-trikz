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

export interface ISocketMessageEvent {
  socket: Socket;
  event: number;
  payload: unknown;
}
