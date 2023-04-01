import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  AnticheatNotificationEventPayload,
  ChatMessageEventPayload,
  DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD,
  DISCORD_SEND_EXECUTED_RCON_COMMAND_WEBHOOK_CMD,
  DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD,
  DiscordSendAnticheatNotificationPayload,
  DiscordSendExecutedRconCommandPayload,
  DiscordSendGameChatMessagePayload,
  DiscordSendMapChangeMessagePayload,
  DiscordSendPlayerConnectMessagePayload,
  DiscordSendPlayerDisconnectMessagePayload,
  DiscordSendRecordNotificationPayload,
  ExecuteRconCommandEventPayload,
  HandshakeEventPayload,
  MapChangeEventPayload,
  PlayerConnectEventPayload,
  PlayerDisconnectEventPayload,
  RecordEventPayload,
  SocketEventCodes,
} from "@trikztime/ecosystem-shared/const";
import { encryptString } from "@trikztime/ecosystem-shared/utils";
import { createServer, Server, Socket } from "net";

import { BroadcastClientCheck, ISocketClientInfo, ISocketEventMessage } from "./types";
import { broadcastSameChatChannelId, OnMessageCompleteCallback, SocketDataHandler } from "./utils";

const logger = new Logger("Socket");
const HANDSHAKE_TIMEOUT = 5000;

@Injectable()
export class SocketService {
  private encryptionKey: string;
  private server: Server;
  private clients: Map<Socket, ISocketClientInfo | null> = new Map();
  private handshakeTimeouts: Map<Socket, NodeJS.Timeout> = new Map();
  private clientSocketDataHandlers: Map<Socket, SocketDataHandler> = new Map();

  constructor(@Inject(configService.config?.discord.serviceToken) private discordServiceClient: ClientProxy) {
    if (!configService.config?.tempDataEncryptionKey) {
      throw new Error("Encryption Key is not set");
    }

    this.encryptionKey = configService.config.tempDataEncryptionKey;

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

  broadcast(eventMessage: ISocketEventMessage, shouldSendMessage?: BroadcastClientCheck) {
    const clientsTuple = Array.from(this.clients.entries());
    const systemMessage = this.formatEventMessage(eventMessage);

    clientsTuple.forEach(([socket, clientInfo]) => {
      if (socket === eventMessage.socket) return;

      if (!clientInfo) return;

      if (!shouldSendMessage || shouldSendMessage(clientInfo)) {
        socket.write(systemMessage);
      }
    });
  }

  sendToOne(socket: Socket, eventMessage: ISocketEventMessage) {
    const systemMessage = this.formatEventMessage(eventMessage);
    socket.write(systemMessage);
  }

  emitExecuteRconCommandEvent(eventData: ExecuteRconCommandEventPayload) {
    const { channelId } = eventData;

    const eventMessage: ISocketEventMessage<typeof eventData> = {
      event: SocketEventCodes.executeRconCommand,
      payload: eventData,
    };

    // поиск первого сервера по rcon каналу
    const client = Array.from(this.clients.values()).find(
      (socket) => socket?.config.discordRconChannelId === channelId,
    );
    if (!client) return;

    this.sendToOne(client.socket, eventMessage);
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

  private formatEventMessage(eventMessage: ISocketEventMessage) {
    const messageObject = {
      event: eventMessage.event,
      payload: eventMessage.payload,
    };
    const json = JSON.stringify(messageObject);

    const byteLength = Buffer.byteLength(json, "utf8");
    const header = byteLength.toString().padStart(4, "0");

    const systemReadyMessage = `${header}${json}`;

    return systemReadyMessage;
  }

  private handleClientProcessedMessage(socket: Socket, message: ISocketEventMessage) {
    switch (message.event) {
      case SocketEventCodes.handshake: {
        this.handleHandshakeEvent(socket, message as ISocketEventMessage<HandshakeEventPayload>);
        break;
      }
      case SocketEventCodes.chatMessage: {
        this.handleChatMessageEvent(socket, message as ISocketEventMessage<ChatMessageEventPayload>);
        break;
      }
      case SocketEventCodes.playerConnect: {
        this.handlePlayerConnectEvent(socket, message as ISocketEventMessage<PlayerConnectEventPayload>);
        break;
      }
      case SocketEventCodes.playerDisconnect: {
        this.handlePlayerDisconnectEvent(socket, message as ISocketEventMessage<PlayerDisconnectEventPayload>);
        break;
      }
      case SocketEventCodes.mapChange: {
        this.handleMapChangeEvent(socket, message as ISocketEventMessage<MapChangeEventPayload>);
        break;
      }
      case SocketEventCodes.anticheatNotification: {
        this.handleAnticheatNotificationEvent(
          socket,
          message as ISocketEventMessage<AnticheatNotificationEventPayload>,
        );
        break;
      }
      case SocketEventCodes.record: {
        this.handleRecordEvent(socket, message as ISocketEventMessage<RecordEventPayload>);
        break;
      }
      case SocketEventCodes.executeRconCommand: {
        this.handleExecutedRconCommandEvent(socket, message as ISocketEventMessage<ExecuteRconCommandEventPayload>);
        break;
      }
    }
  }

  private handleHandshakeEvent(socket: Socket, eventMessage: ISocketEventMessage<HandshakeEventPayload>) {
    const { id } = eventMessage.payload;
    const socketClientConfig = configService.config?.servers.find((server) => server.id === id);

    if (socketClientConfig) {
      this.updateSocketClientInfo(socket, { socket, config: socketClientConfig });

      const timeout = this.handshakeTimeouts.get(socket);
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  private handleChatMessageEvent(socket: Socket, eventMessage: ISocketEventMessage<ChatMessageEventPayload>) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendGameChatMessagePayload>(
      DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordChatWebhookUrl, this.encryptionKey),
          channelId: discordChatChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );

    this.broadcast(eventMessage, broadcastSameChatChannelId(discordChatChannelId));
  }

  private handlePlayerConnectEvent(socket: Socket, eventMessage: ISocketEventMessage<PlayerConnectEventPayload>) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendPlayerConnectMessagePayload>(
      DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordChatWebhookUrl, this.encryptionKey),
          channelId: discordChatChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );

    this.broadcast(eventMessage, broadcastSameChatChannelId(discordChatChannelId));
  }

  private handlePlayerDisconnectEvent(socket: Socket, eventMessage: ISocketEventMessage<PlayerDisconnectEventPayload>) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendPlayerDisconnectMessagePayload>(
      DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordChatWebhookUrl, this.encryptionKey),
          channelId: discordChatChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );

    this.broadcast(eventMessage, broadcastSameChatChannelId(discordChatChannelId));
  }

  private handleMapChangeEvent(socket: Socket, eventMessage: ISocketEventMessage<MapChangeEventPayload>) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordChatWebhookUrl, discordChatChannelId } = clientConfig;
    if (!discordChatChannelId || !discordChatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendMapChangeMessagePayload>(
      DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordChatWebhookUrl, this.encryptionKey),
          channelId: discordChatChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );

    this.broadcast(eventMessage, broadcastSameChatChannelId(discordChatChannelId));
  }

  private handleAnticheatNotificationEvent(
    socket: Socket,
    eventMessage: ISocketEventMessage<AnticheatNotificationEventPayload>,
  ) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordAnticheatChannelId, discordAnticheatWebhookUrl } = clientConfig;
    if (!discordAnticheatChannelId || !discordAnticheatWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendAnticheatNotificationPayload>(
      DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordAnticheatWebhookUrl, this.encryptionKey),
          channelId: discordAnticheatChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );
  }

  private handleRecordEvent(socket: Socket, eventMessage: ISocketEventMessage<RecordEventPayload>) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordRecordsChannelId, discordRecordsWebhookUrl } = clientConfig;
    if (!discordRecordsChannelId || !discordRecordsWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendRecordNotificationPayload>(
      DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordRecordsWebhookUrl, this.encryptionKey),
          channelId: discordRecordsChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );

    this.broadcast(eventMessage);
  }

  private handleExecutedRconCommandEvent(
    socket: Socket,
    eventMessage: ISocketEventMessage<ExecuteRconCommandEventPayload>,
  ) {
    const clientConfig = this.clients.get(socket)?.config;
    if (!clientConfig) return;

    const { id, discordRconChannelId, discordRconWebhookUrl } = clientConfig;
    if (!discordRconChannelId || !discordRconWebhookUrl) return;

    this.discordServiceClient.emit<void, DiscordSendExecutedRconCommandPayload>(
      DISCORD_SEND_EXECUTED_RCON_COMMAND_WEBHOOK_CMD,
      {
        discordData: {
          url: encryptString(discordRconWebhookUrl, this.encryptionKey),
          channelId: discordRconChannelId,
          serverId: id,
        },
        eventData: eventMessage.payload,
      },
    );
  }
}
