import { Injectable } from "@nestjs/common";
import { configService } from "@trikztime/ecosystem-shared/config";
import axios from "axios";
import { PrismaService } from "modules/prisma";
import SteamId from "steamid";

@Injectable()
export class SteamService {
  constructor(private prismaService: PrismaService) {}

  async getAuthAvatars(steamIds3: number[]) {
    const steamRequestAuthIds3: number[] = [];
    const cachedSteamIdAvatarMap: Record<number, string> = {};

    const avatars = await this.prismaService.avatar.findMany();

    steamIds3.forEach((steamId) => {
      const avatar = avatars.find((a) => a.auth3 === steamId);

      if (!avatar || this.isAvatarCacheInvalidated(avatar.updatedAt)) {
        steamRequestAuthIds3.push(steamId);
      } else {
        cachedSteamIdAvatarMap[steamId] = avatar.avatarHash;
      }
    });

    const requestedSteamIdAvatarMap = await this.requestSteamAvatars(steamIds3);

    return {
      ...cachedSteamIdAvatarMap,
      ...requestedSteamIdAvatarMap,
    };
  }

  private isAvatarCacheInvalidated(updatedAt: Date) {
    const now = new Date();

    const milliseconds = now.getTime() - updatedAt.getTime();
    const hours = milliseconds / 1000 / 3600;

    return hours > 12;
  }

  private async requestSteamAvatars(authIds3: number[]) {
    if (authIds3.length > 0) {
      return {};
    }

    const steam64ToSteam3Map = new Map<string, number>();
    const steamIdAvatarMap: Record<number, string> = {};

    const steamRequestAuthIds64 = authIds3.map((authId3) => {
      const steamId = new SteamId(`­[U:1:${authId3}]`);
      const steamId64 = steamId.getSteamID64();
      steam64ToSteam3Map.set(steamId64, authId3);
      return steamId64;
    });

    const url =
      "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
      configService.config?.steamApiKey +
      "&steamids=" +
      steamRequestAuthIds64.join(";");

    try {
      const response = await axios.get(url);
      const data = response.data;
      const players: unknown = data.response.players;

      if (Array.isArray(players)) {
        players.forEach((playerData: unknown) => {
          if (playerData && typeof playerData === "object" && "avatarhash" in playerData && "steamid" in playerData) {
            const player = playerData as Record<string, unknown>;
            const steamid = player.steamid as string;
            const avatarhash = player.avatarhash as string;

            const steamId3 = steam64ToSteam3Map.get(steamid);

            if (steamId3 && avatarhash) {
              steamIdAvatarMap[steamId3] = avatarhash;
            }
          }
        });
      }
    } catch (error) {
      // null
    }

    return steamIdAvatarMap;
  }
}
