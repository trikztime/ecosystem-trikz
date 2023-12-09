import { Injectable } from "@nestjs/common";
import { PrismaService } from "modules/prisma";

@Injectable()
export class MapsService {
  constructor(private prismaService: PrismaService) {}

  async getMapsList() {
    const maps = await this.prismaService.map.findMany();

    return maps;
  }

  async getMapsCount() {
    return await this.prismaService.map.count();
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
