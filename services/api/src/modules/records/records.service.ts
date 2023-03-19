import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "modules/prisma";

@Injectable()
export class RecordsService {
  constructor(private prismaService: PrismaService) {}

  async getRecords(whereArgs: Prisma.PlayertimeFindManyArgs["where"]) {
    const records = await this.prismaService.playertime.findMany({
      where: whereArgs,
    });

    return records;
  }
}
