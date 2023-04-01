import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import {
  GATEWAY_SOCKET_BROADCAST_DISCORD_CHAT_MESSAGE_EVENT_CMD,
  GATEWAY_SOCKET_EXECUTE_RCON_COMMAND_EVENT_CMD,
  GatewaySocketBroadcastChatMessageEventPayload,
  GatewaySocketExecuteRconCommandEventPayload,
  SocketEventCodes,
} from "@trikztime/ecosystem-shared/const";

import { SocketService } from "./socket.service";
import { ISocketEventMessage } from "./types";
import { broadcastSameChatChannelId } from "./utils";

@Controller()
export class SocketController {
  constructor(private socketService: SocketService) {}

  @EventPattern(GATEWAY_SOCKET_BROADCAST_DISCORD_CHAT_MESSAGE_EVENT_CMD)
  broadcastDiscordChatMessageEvent(@Payload() payload: GatewaySocketBroadcastChatMessageEventPayload) {
    const { discordData, eventData } = payload;

    const eventMessage: ISocketEventMessage<typeof eventData> = {
      event: SocketEventCodes.chatMessage,
      payload: eventData,
    };
    this.socketService.broadcast(eventMessage, broadcastSameChatChannelId(discordData.channelId));
  }

  @EventPattern(GATEWAY_SOCKET_EXECUTE_RCON_COMMAND_EVENT_CMD)
  executeRconCommandEvent(@Payload() payload: GatewaySocketExecuteRconCommandEventPayload) {
    const { eventData } = payload;

    this.socketService.emitExecuteRconCommandEvent(eventData);
  }
}
