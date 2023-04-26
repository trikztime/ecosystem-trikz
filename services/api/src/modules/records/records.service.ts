import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { isDefined } from "@trikztime/ecosystem-shared/utils";
import { PrismaService } from "modules/prisma";

import { convertPrismaRecordToRecord } from "./../../converters/record";

@Injectable()
export class RecordsService {
  constructor(private prismaService: PrismaService) {}

  async getRecords(whereArgs: Prisma.PlayertimeFindManyArgs["where"]): Promise<RecordDTO[]> {
    const records = await this.prismaService.playertime.findMany({
      where: whereArgs,
      include: {
        user1: true,
        user2: true,
      },
    });

    return records
      .map((record): RecordDTO | null => {
        if (!record.user1 || !record.user2) return null;
        return convertPrismaRecordToRecord(record, record.user1, record.user2);
      })
      .filter(isDefined);
  }
}
