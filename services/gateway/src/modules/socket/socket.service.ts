import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD,
  DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD,
  DiscordSendAnticheatNotificationPayload,
  DiscordSendGameChatMessagePayload,
  DiscordSendMapChangeMessagePayload,
  DiscordSendPlayerConnectMessagePayload,
  DiscordSendPlayerDisconnectMessagePayload,
  DiscordSendRecordNotificationPayload,
} from "@trikztime/ecosystem-shared/const";
import { createServer, Server, Socket } from "net";

import {
  AnticheatNotificationEventPayload,
  ChatMessageEventPayload,
  HandshakeEventPayload,
  MapChangeEventPayload,
  PlayerConnectEventPayload,
  PlayerDisconnectEventPayload,
  RecordNotificationEventPayload,
  SocketEventCodes,
} from "./events";
import { ISocketClientInfo, ISocketMessageEvent } from "./types";
import { OnMessageCompleteCallback, SocketDataHandler } from "./utils";

const logger = new Logger("Socket");
const HANDSHAKE_TIMEOUT = 5000;

@Injectable()
export class SocketService {
  private server: Server;
  private clients: Map<Socket, ISocketClientInfo | null> = new Map();
  private handshakeTimeouts: Map<Socket, NodeJS.Timeout> = new Map();
  private clientSocketDataHandlers: Map<Socket, SocketDataHandler> = new Map();

  constructor(@Inject(configService.config?.discord.serviceToken) private discordServiceClient: ClientProxy) {
    this.clients.clear();
    this.handshakeTimeouts.clear();
    this.clientSocketDataHandlers.clear();

    this.server = createServer();
    this.server.on("connection", this.handleConnection.bind(this));
    this.server.on("close", () => this.deleteAllClients.bind(this));
    this.server.on("error", () => this.deleteAllClients.bind(this));

    // TODO порт в env
    const port = 5000;
    this.server.listen(port, () => {
      logger.log(`Socket started at ${port}`);
    });
  }

  private deleteAllClients() {
    const clients = Array.from(this.clients.keys());
    clients.forEach((socket) => this.deleteClientSocket(socket));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private isClientWhitelisted(socket: Socket): boolean {
    // TODO проверка вайтлист
    return true;
  }

  private handleConnection(socket: Socket) {
    if (!this.isClientWhitelisted(socket)) {
      logger.warn(`Connection refused from ${socket.remoteAddress}:${socket.remotePort}`);
      socket.destroy();
      return;
    }

    logger.warn(`Client connected ${socket.remoteAddress}:${socket.remotePort}`);

    // установка null в данные клиента до получения хендшейка
    this.updateSocketClientInfo(socket, null);

    // подписка на готовые сообщения
    const onMessageComplete: OnMessageCompleteCallback = (message) => {
      this.handleClientProcessedMessage(socket, message);
    };
    const socketHandler = new SocketDataHandler(onMessageComplete);
    this.clientSocketDataHandlers.set(socket, socketHandler);

    // если хендшейк не пришел в течении нужного времени - удалить клиента
    const timeout = setTimeout(() => this.deleteClientSocket(socket), HANDSHAKE_TIMEOUT);
    this.handshakeTimeouts.set(socket, timeout);

    socket.on("error", () => this.handleClientError(socket));
    socket.on("close", () => this.handleClientDisconnect(socket));
    socket.on("data", (data) => this.handleClientData(socket, data));
  }

  private handleClientError(socket: Socket) {
    logger.warn(`Client error ${socket.remoteAddress}:${socket.remotePort}`);
    this.deleteClientSocket(socket);
  }

  private handleClientDisconnect(socket: Socket) {
    logger.warn(`Client disconnected ${socket.remoteAddress}:${socket.remotePort}`);
    this.deleteClientSocket(socket);
  }

  private handleClientData(socket: Socket, data: Buffer) {
    if (!this.isClientWhitelisted(socket)) {
      socket.destroy();
      return;
    }

    logger.debug(`DATA: ${data}`);
    const dataHandler = this.clientSocketDataHandlers.get(socket);
    dataHandler?.handleSocketData(socket, data);
  }

  private deleteClientSocket(socket: Socket) {
    const timeout = this.handshakeTimeouts.get(socket);
    if (timeout) clearTimeout(timeout);

    this.clients.delete(socket);
    this.handshakeTimeouts.delete(socket);
    this.clientSocketDataHandlers.delete(socket);

    socket.destroy();
  }

  private updateSocketClientInfo(socket: Socket, socketData: ISocketClientInfo | null) {
    this.clients.set(socket, socketData);
  }

  private handleClientProcessedMessage(socket: Socket, message: ISocketMessageEvent) {
    switch (message.event) {
      case SocketEventCodes.handshake: {
        const payload = message.payload as HandshakeEventPayload;
        this.handleHandshakeEvent(socket, payload);
        break;
      }
      case SocketEventCodes.chatMessage: {
        const payload = message.payload as ChatMessageEventPayload;
        this.handleChatMessageEvent(socket, payload);
        break;
      }
      case SocketEventCodes.playerConnect: {
        const payload = message.payload as PlayerConnectEventPayload;
        this.handlePlayerConnectEvent(socket, payload);
        break;
      }
      case SocketEventCodes.playerDisconnect: {
        const payload = message.payload as PlayerDisconnectEventPayload;
        this.handlePlayerDisconnectEvent(socket, payload);
        break;
      }
      case SocketEventCodes.mapChange: {
        const payload = message.payload as MapChangeEventPayload;
        this.handleMapChangeEvent(socket, payload);
        break;
      }
      case SocketEventCodes.anticheatNotification: {
        const payload = message.payload as AnticheatNotificationEventPayload;
        this.handleAnticheatNotificationEvent(socket, payload);
        break;
      }
      case SocketEventCodes.recordNotification: {
        const payload = message.payload as RecordNotificationEventPayload;
        this.handleRecordNotificationEvent(socket, payload);
        break;
      }
    }
  }

  private handleHandshakeEvent(socket: Socket, payload: HandshakeEventPayload) {
    const { id } = payload;
    const socketClientConfig = configService.config?.servers.find((server) => server.id === id);

    if (socketClientConfig) {
      this.updateSocketClientInfo(socket, { socket, config: socketClientConfig });

      const timeout = this.handshakeTimeouts.get(socket);
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  private handleChatMessageEvent(socket: Socket, payload: ChatMessageEventPayload) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    const { authId, message, name } = payload;

    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendGameChatMessagePayload>(
      DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD,
      {
        url: discordChatWebhookUrl,
        channelId: discordChatChannelId,
        serverId: id,
        authId,
        message,
        name,
      },
    );
  }

  private handlePlayerConnectEvent(socket: Socket, payload: PlayerConnectEventPayload) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    const { authId, name } = payload;

    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendPlayerConnectMessagePayload>(
      DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD,
      {
        url: discordChatWebhookUrl,
        channelId: discordChatChannelId,
        serverId: id,
        authId,
        name,
      },
    );
  }

  private handlePlayerDisconnectEvent(socket: Socket, payload: PlayerDisconnectEventPayload) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    const { authId, name, reason } = payload;

    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendPlayerDisconnectMessagePayload>(
      DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD,
      {
        url: discordChatWebhookUrl,
        channelId: discordChatChannelId,
        serverId: id,
        authId,
        name,
        reason,
      },
    );
  }

  private handleMapChangeEvent(socket: Socket, payload: MapChangeEventPayload) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    const { name } = payload;

    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendMapChangeMessagePayload>(
      DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD,
      {
        url: discordChatWebhookUrl,
        channelId: discordChatChannelId,
        serverId: id,
        mapName: name,
      },
    );
  }

  private handleAnticheatNotificationEvent(socket: Socket, payload: AnticheatNotificationEventPayload) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordAnticheatChannelId, discordAnticheatWebhookUrl } = clientConfig;
    const { authId, name, map, track, message } = payload;

    if (!discordAnticheatChannelId || !discordAnticheatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendAnticheatNotificationPayload>(
      DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD,
      {
        url: discordAnticheatWebhookUrl,
        channelId: discordAnticheatChannelId,
        serverId: id,
        authId,
        playerName: name,
        mapName: map,
        track,
        message,
      },
    );
  }

  private handleRecordNotificationEvent(socket: Socket, payload: RecordNotificationEventPayload) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordRecordsChannelId, discordRecordsWebhookUrl } = clientConfig;
    const { name1, name2, map, time, oldWR, track, style } = payload;

    if (!discordRecordsChannelId || !discordRecordsWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendRecordNotificationPayload>(
      DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD,
      {
        url: discordRecordsWebhookUrl,
        channelId: discordRecordsWebhookUrl,
        serverId: id,
        playerName1: name1,
        playerName2: name2,
        mapName: map,
        time,
        oldWR,
        track,
        style,
      },
    );
  }
}
