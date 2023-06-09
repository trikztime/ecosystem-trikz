import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import {
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
} from "@trikztime/ecosystem-shared/const";
import { DiscordService } from "discord.service";

@Controller()
export class DiscordController {
  constructor(private discordService: DiscordService) {}

  @EventPattern(DISCORD_SEND_GAME_CHAT_MESSAGE_WEBHOOK_CMD)
  async sendGameChatMessage(@Payload() payload: DiscordSendGameChatMessagePayload) {
    const task = async () => await this.discordService.sendGameChatMessageWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }

  @EventPattern(DISCORD_SEND_PLAYER_CONNECT_MESSAGE_WEBHOOK_CMD)
  async sendPlayerConnectMessage(@Payload() payload: DiscordSendPlayerConnectMessagePayload) {
    const task = async () => await this.discordService.sendPlayerConnectMessageWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }

  @EventPattern(DISCORD_SEND_PLAYER_DISCONNECT_MESSAGE_WEBHOOK_CMD)
  async sendPlayerDisconnectMessage(@Payload() payload: DiscordSendPlayerDisconnectMessagePayload) {
    const task = async () => await this.discordService.sendPlayerDisconnectMessageWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }

  @EventPattern(DISCORD_SEND_MAP_CHANGE_MESSAGE_WEBHOOK_CMD)
  async sendMapChangeMessage(@Payload() payload: DiscordSendMapChangeMessagePayload) {
    const task = async () => await this.discordService.sendMapChangeMessageWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }

  @EventPattern(DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD)
  async sendRecordNotification(@Payload() payload: DiscordSendRecordNotificationPayload) {
    const task = async () => await this.discordService.sendRecordNotificationWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }

  @EventPattern(DISCORD_SEND_ANTICHEAT_NOTIFICATION_WEBHOOK_CMD)
  async sendAnticheatNotification(@Payload() payload: DiscordSendAnticheatNotificationPayload) {
    const task = async () => await this.discordService.sendAnticheatNotificationWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }

  @EventPattern(DISCORD_SEND_EXECUTED_RCON_COMMAND_WEBHOOK_CMD)
  async sendExecutedRconCommand(@Payload() payload: DiscordSendExecutedRconCommandPayload) {
    const task = async () => await this.discordService.sendExecutedRconCommandWebhook(payload);
    this.discordService.addChannelTaskToQueue(payload.discordData.channelId, task);
  }
}
