import { Socket } from "net";

export interface IDiscordChat {
  channelId: string;
  webhookId: string;
  webhookToken: string;
}

export interface IClientSocket {
  socket: Socket;
  serverId: string;
  discordChat?: IDiscordChat;
}

export interface ISocketMessageEvent {
  socket: Socket;
  event: number;
  payload: unknown;
}
