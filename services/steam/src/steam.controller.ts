import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { STEAM_GET_AUTH_AVATARS_CMD, SteamGetAuthAvatarsPayload } from "@trikztime/ecosystem-shared/const";
import { SteamService } from "steam.service";

@Controller()
export class SteamController {
  constructor(private steamService: SteamService) {}

  @EventPattern(STEAM_GET_AUTH_AVATARS_CMD)
  async getAuthAvatar(@Payload() payload: SteamGetAuthAvatarsPayload) {
    return await this.steamService.getAuthAvatars(payload.steamIds3);
  }
}
