import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import {
  GATEWAY_SOCKET_EMIT_DISCORD_CHAT_MESSAGE_EVENT_CMD,
  GatewaySocketEmitChatMessageEventPayload,
  SocketEventCodes,
} from "@trikztime/ecosystem-shared/const";

import { SocketService } from "./socket.service";
import { ISocketEventMessage } from "./types";
import { broadcastSameChatChannelId } from "./utils";

@Controller()
export class SocketController {
  constructor(private socketService: SocketService) {}

  @EventPattern(GATEWAY_SOCKET_EMIT_DISCORD_CHAT_MESSAGE_EVENT_CMD)
  emitDiscordChatMessageEvent(@Payload() payload: GatewaySocketEmitChatMessageEventPayload) {
    const { discordData, eventData } = payload;
    const eventMessage: ISocketEventMessage<typeof eventData> = {
      event: SocketEventCodes.chatMessage,
      payload: eventData,
    };
    this.socketService.broadcast(eventMessage, broadcastSameChatChannelId(discordData.channelId));
  }
}
