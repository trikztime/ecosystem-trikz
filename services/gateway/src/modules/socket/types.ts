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
  sender: Socket;
  event: number;
  payload: unknown;
}
