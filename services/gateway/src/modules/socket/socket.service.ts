import { Injectable, Logger } from "@nestjs/common";
import { configService } from "@trikztime/ecosystem-shared/config";
import { createServer, Server, Socket } from "net";

import { HandshakeEventPayload, SocketEventCodes } from "./events";
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

  constructor() {
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

  private handleClientError(socket: Socket) {
    this.deleteClientSocket(socket);
  }

  private handleClientDisconnect(socket: Socket) {
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

  private handleClientProcessedMessage(socket: Socket, message: ISocketMessageEvent) {
    switch (message.event) {
      case SocketEventCodes.handshake: {
        const payload = message.payload as HandshakeEventPayload;
        this.handleHandshakeEvent(socket, payload);
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
}
