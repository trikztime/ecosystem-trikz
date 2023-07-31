import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { STEAM_GET_AUTH_AVATARS, SteamGetAuthAvatars } from "@trikztime/ecosystem-shared/const";
import { SteamService } from "steam.service";

@Controller()
export class SteamController {
  constructor(private steamService: SteamService) {}

  @EventPattern(STEAM_GET_AUTH_AVATARS)
  async getAuthAvatar(@Payload() payload: SteamGetAuthAvatars) {
    return this.steamService.getAuthAvatars(payload.authIds3);
  }
}
