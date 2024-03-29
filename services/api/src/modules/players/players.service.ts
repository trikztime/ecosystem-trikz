import { Injectable } from "@nestjs/common";
import { PlayerDTO } from "@trikztime/ecosystem-shared/dto";
import { isDefined } from "@trikztime/ecosystem-shared/utils";
import { PrismaService } from "modules/prisma";
import { getCountryCodesDictionary, getCountryNameFromCode } from "utils";

@Injectable()
export class PlayersService {
  constructor(private prismaService: PrismaService) {}

  async getPlayersList() {
    const prismaUsers = await this.prismaService.user.findMany();

    const userIps = prismaUsers.map((user) => user.ip).filter(isDefined);
    const uniqueUserIps = Array.from(new Set(userIps));
    const countryCodesDictionary = await getCountryCodesDictionary(uniqueUserIps);

    const players = prismaUsers.map((user): PlayerDTO => {
      const { auth, name, ip, lastlogin } = user;
      const countryCode = ip ? countryCodesDictionary.get(ip) ?? null : null;
      const countryName = getCountryNameFromCode(countryCode);

      return {
        auth,
        name: name ?? "<unknown>",
        countryCode,
        countryName,
        lastLogin: lastlogin,
      };
    });

    return players;
  }

  async getPlayersCount() {
    return await this.prismaService.user.count();
  }

  async getPlayerByAuth(authId: number) {
    const prismaUser = await this.prismaService.user.findUnique({
      where: {
        auth: authId,
      },
    });

    if (!prismaUser) return null;

    const { auth, name, ip, lastlogin } = prismaUser;
    const requiredIpArray = [ip].filter(isDefined);
    const countryCodesDictionary = await getCountryCodesDictionary(requiredIpArray);
    const countryCode = ip ? countryCodesDictionary.get(ip) ?? null : null;
    const countryName = getCountryNameFromCode(countryCode);

    const player: PlayerDTO = {
      auth,
      name: name ?? "<unknown>",
      countryCode,
      countryName,
      lastLogin: lastlogin,
    };

    return player;
  }
}
