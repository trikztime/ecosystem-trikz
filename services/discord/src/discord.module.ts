import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";
import { AvatarService } from "avatar.service";
import { DiscordController } from "discord.controller";
import { DiscordService } from "discord.service";

@Module({
  imports: [ClientsRegisterModule],
  controllers: [DiscordController],
  providers: [DiscordService, AvatarService],
})
export class DiscordModule {}
