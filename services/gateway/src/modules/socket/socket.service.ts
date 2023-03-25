import { Injectable, Logger } from "@nestjs/common";
import { createServer, Server, Socket } from "net";

import { HandshakeEventPayload, SocketEventCodes } from "./events";
import { IClientSocket, ISocketMessageEvent } from "./types";
import { SocketDataHandler } from "./utils/socket-data-handler";

const logger = new Logger("Socket");
const HANDSHAKE_TIMEOUT = 5000;

@Injectable()
export class SocketService {
  private server: Server;
  private clients: Map<Socket, IClientSocket | null> = new Map();
  private handshakeTimeouts: Map<Socket, NodeJS.Timeout> = new Map();
  private clientSocketDataHandlers: Map<Socket, SocketDataHandler> = new Map();

  constructor() {
    this.clients.clear();
    this.handshakeTimeouts.clear();
    this.clientSocketDataHandlers.clear();

    this.server = createServer();
    this.server.on("connection", this.handleConnection.bind(this));

    // TODO порт в env
    const port = 5000;
    this.server.listen(port, () => {
      logger.log(`Socket started at ${port}`);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private isClientWhitelisted(socket: Socket): boolean {
    // TODO проверка вайилист
    return true;
  }

  private handleConnection(socket: Socket) {
    if (!this.isClientWhitelisted(socket)) {
      logger.warn(`Connection refused from ${socket.remoteAddress}:${socket.remotePort}`);
      socket.destroy();
      return;
    }

    this.updateClientSocketData(socket, null);

    socket.on("error", () => null);
    socket.on("close", this.handleClientDisconnect.bind(this));
    socket.on("data", (data) => this.handleClientData(socket, data));

    // подписка на готовые сообщения
    const socketHandler = new SocketDataHandler();
    socketHandler.subject.subscribe({
      next: (messageEvent) => {
        this.handleClientParsedEvent(socket, messageEvent);
      },
    });
    this.clientSocketDataHandlers.set(socket, socketHandler);

    // таймаут хендшейка
    const timeout = setTimeout(() => {
      this.deleteClientData(socket);
      socket.destroy();
    }, HANDSHAKE_TIMEOUT);
    this.handshakeTimeouts.set(socket, timeout);
  }

  private deleteClientData(socket: Socket) {
    const timeout = this.handshakeTimeouts.get(socket);
    const socketHandler = this.clientSocketDataHandlers.get(socket);
    this.handshakeTimeouts.delete(socket);
    this.clientSocketDataHandlers.delete(socket);

    if (timeout) clearTimeout(timeout);
    if (socketHandler) socketHandler.subject.unsubscribe();
  }

  private updateClientSocketData(socket: Socket, socketData: IClientSocket | null) {
    this.clients.set(socket, socketData);

    // TODO вынести в обработку ивента handshake
    const timeout = this.handshakeTimeouts.get(socket);
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  private handleClientDisconnect(socket: Socket) {
    this.deleteClientData(socket);
    this.clients.delete(socket);
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

  private handleClientParsedEvent(socket: Socket, message: ISocketMessageEvent) {
    switch (message.event) {
      case SocketEventCodes.handshake: {
        // TODO добавить хендлеры
        const payload = message.payload as HandshakeEventPayload;
        this.updateClientSocketData(socket, { socket, serverId: payload.id ?? null });
      }
    }
  }
}
