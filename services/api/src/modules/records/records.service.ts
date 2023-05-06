import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { isDefined } from "@trikztime/ecosystem-shared/utils";
import geoip from "fast-geoip";
import { PrismaService } from "modules/prisma";
import { RawRecord, RawUser } from "types";
import { ipNumberToIpv4 } from "utils";

import { convertRawRecordToRecord } from "./../../converters/record";

@Injectable()
export class RecordsService {
  constructor(private prismaService: PrismaService) {}

  async getRecords(
    map: string | undefined,
    track: number | undefined,
    style: number | undefined,
    authId: number | undefined,
  ): Promise<RecordDTO[]> {
    const allRecords = await this.prismaService.playertime.findMany();
    const sortedAllRecords = [...allRecords].sort((a, b) => Number(a.time) - Number(b.time));

    const rawRecordsQuery = Prisma.sql`
      SELECT p.*,
        u1.auth as user1_auth, u1.name as user1_name, u1.ip as user1_ip, u1.lastlogin as user1_lastlogin,
        u2.auth as user2_auth, u2.name as user2_name, u2.ip as user2_ip, u2.lastlogin as user2_lastlogin
      FROM playertimes p
      JOIN users u1 ON p.auth = u1.auth
      JOIN users u2 ON p.auth2 = u2.auth
      WHERE
        (p.map = ${map} OR ${map} IS NULL)
        AND (p.track = ${track} OR ${track} IS NULL)
        AND (p.style = ${style} OR ${style} IS NULL)
        AND (p.auth = ${authId} OR p.auth2 = ${authId} OR ${authId} IS NULL)
    `;

    const rawRecords = await this.prismaService.$queryRaw<RawRecord[]>(rawRecordsQuery);
    const countryCodesDictionary = await this.getRecordsCountryCodesDictionary(rawRecords);

    const mappedRecords = rawRecords.map((rawRecord): RecordDTO => {
      const topForRecord = sortedAllRecords.filter((record) => {
        const isSameMap = record.map === rawRecord.map;
        const isSameTrack = record.track === rawRecord.track;
        const isSameStyle = record.style === rawRecord.style;
        return isSameMap && isSameTrack && isSameStyle;
      });

      const position = topForRecord.findIndex((record) => record.id === rawRecord.id) + 1;

      const user1: RawUser = {
        auth: rawRecord.user1_auth,
        name: rawRecord.user1_name,
        ip: rawRecord.user1_ip,
        lastlogin: rawRecord.user1_lastlogin,
      };
      const user2: RawUser = {
        auth: rawRecord.user2_auth,
        name: rawRecord.user2_name,
        ip: rawRecord.user2_ip,
        lastlogin: rawRecord.user2_lastlogin,
      };

      const countryCode1 = user1.ip ? countryCodesDictionary.get(user1.ip) ?? null : null;
      const countryCode2 = user2.ip ? countryCodesDictionary.get(user2.ip) ?? null : null;

      return convertRawRecordToRecord(rawRecord, position, user1, user2, countryCode1, countryCode2);
    });

    return mappedRecords;
  }

  private async getRecordsCountryCodesDictionary(records: RawRecord[]): Promise<Map<number, string | null>> {
    const recordsIps = records
      .flatMap((record) => {
        return [record.user1_ip, record.user2_ip];
      })
      .filter(isDefined);
    const uniqueIps = Array.from(new Set(recordsIps));

    const queryIpsDataPromises = uniqueIps.map((ip) => {
      return new Promise<[number, string | null]>((resolve) => {
        const ipv4 = ipNumberToIpv4(ip);
        geoip.lookup(ipv4).then((ipInfo) => {
          resolve([ip, ipInfo?.country ?? null]);
        });
      });
    });

    const ipInfoObjects = await Promise.all(queryIpsDataPromises);

    const dictionary = new Map<number, string | null>();
    ipInfoObjects.forEach(([ip, countryCode]) => {
      dictionary.set(ip, countryCode);
    });

    return dictionary;
  }
}
