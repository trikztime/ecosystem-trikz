import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD,
  DiscordSendRecordNotificationPayload,
} from "@trikztime/ecosystem-shared/const";
import { DiscordService } from "discord.service";

@Controller()
export class DiscordController {
  constructor(private discordService: DiscordService) {}

  @MessagePattern({ cmd: DISCORD_SEND_RECORD_NOTIFICATION_WEBHOOK_CMD })
  async sendRecordNotification(@Payload() payload: DiscordSendRecordNotificationPayload) {
    await this.discordService.sendRecordNotificationWebhook(payload);
  }
}
