import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD,
  DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD,
  DiscordSendGameChatMessagePayload,
  DiscordSendMapChangeMessagePayload,
  DiscordSendPlayerConnectMessagePayload,
  DiscordSendPlayerDisconnectMessagePayload,
  DiscordSendRecordNotificationPayload,
} from "@trikztime/ecosystem-shared/const";
import { DiscordService } from "discord.service";

@Controller()
export class DiscordController {
  constructor(private discordService: DiscordService) {}

  @MessagePattern({ cmd: DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD })
  async sendGameChatMessage(@Payload() payload: DiscordSendGameChatMessagePayload) {
    await this.discordService.sendGameChatMessageWebhook(payload);
  }

  @MessagePattern({ cmd: DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD })
  async sendPlayerConnectMessage(@Payload() payload: DiscordSendPlayerConnectMessagePayload) {
    await this.discordService.sendPlayerConnectMessageWebhook(payload);
  }

  @MessagePattern({ cmd: DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD })
  async sendPlayerDisconnectMessage(@Payload() payload: DiscordSendPlayerDisconnectMessagePayload) {
    await this.discordService.sendPlayerDisconnectMessageWebhook(payload);
  }

  @MessagePattern({ cmd: DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD })
  async sendMapChangeMessage(@Payload() payload: DiscordSendMapChangeMessagePayload) {
    await this.discordService.sendMapChangeMessageWebhook(payload);
  }

  @MessagePattern({ cmd: DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD })
  async sendRecordNotification(@Payload() payload: DiscordSendRecordNotificationPayload) {
    await this.discordService.sendRecordNotificationWebhook(payload);
  }
}
