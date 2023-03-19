import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "modules/prisma";

@Injectable()
export class MapsService {
  constructor(private prismaService: PrismaService) {}

  async getMaps(whereArgs?: Prisma.MapFindManyArgs["where"]) {
    const maps = await this.prismaService.map.findMany({
      where: whereArgs,
    });

    return maps;
  }

  async getMapByName(name: string) {
    const map = await this.prismaService.map.findUnique({
      where: {
        map: name,
      },
    });

    return map;
  }
}
