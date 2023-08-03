import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import { STEAM_GET_AUTH_AVATARS_CMD, SteamGetAuthAvatarsPayload } from "@trikztime/ecosystem-shared/const";
import { lastValueFrom } from "rxjs";

const CACHE_LIMIT = 50;

@Injectable()
export class AvatarService {
  private userAvatarHashes: Map<number, string> = new Map();

  constructor(@Inject(configService.config?.steam.serviceToken) private steamServiceClient: ClientProxy) {}

  async getAvatar(authId3: number): Promise<string> {
    let avatarHash = "";

    // попытка получить аватар из кеша
    avatarHash = this.userAvatarHashes.get(authId3) ?? "";

    if (!avatarHash || avatarHash.length === 0) {
      // попытка получить аватар из стим сервиса
      const $avatars = this.steamServiceClient.send<Record<number, string>, SteamGetAuthAvatarsPayload>(
        STEAM_GET_AUTH_AVATARS_CMD,
        {
          authIds3: [Number(authId3)],
        },
      );
      const avatars = await lastValueFrom($avatars);
      const avatarHashFromSteam = avatars[authId3] as string | undefined;

      if (avatarHashFromSteam) {
        this.updateAuthAvatar(authId3, avatarHashFromSteam);
        avatarHash = avatarHashFromSteam;
      }
    }

    return !avatarHash || avatarHash.length === 0 ? "" : `https://avatars.steamstatic.com/${avatarHash}_medium.jpg`;
  }

  private updateAuthAvatar(authId3: number, avatarUrl: string): void {
    if (this.userAvatarHashes.size > CACHE_LIMIT) {
      this.userAvatarHashes.clear();
    }

    this.userAvatarHashes.set(authId3, avatarUrl);
  }
}
