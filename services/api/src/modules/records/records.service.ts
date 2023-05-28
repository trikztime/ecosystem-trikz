import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Playertime, Prisma } from "@prisma/client";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  SKILLRANK_GET_RECORD_GROUP_CMD,
  SKILLRANK_GET_RECORD_POINTS_CMD,
  SkillrankGetRecordGroupPayload,
  SkillrankGetRecordPointsPayload,
} from "@trikztime/ecosystem-shared/const";
import { MapBestTimeDTO, RecordDetailsDTO, RecordDTO, RecordSkillRankDTO } from "@trikztime/ecosystem-shared/dto";
import { isDefined } from "@trikztime/ecosystem-shared/utils";
import geoip from "fast-geoip";
import { PrismaService } from "modules/prisma";
import { lastValueFrom } from "rxjs";
import { RawRecord, RawUser } from "types";
import { ipNumberToIpv4 } from "utils";

import { convertRawRecordToRecord } from "./../../converters/record";

type CountryCodesDictionary = Map<number, string | null>;

@Injectable()
export class RecordsService {
  constructor(
    @Inject(configService.config?.skillrank.serviceToken) private skillrankServiceClient: ClientProxy,
    private prismaService: PrismaService,
  ) {}

  async getRecords(
    map: string | undefined,
    track: number | undefined,
    style: number | undefined,
    authId: number | undefined,
  ): Promise<RecordDTO[]> {
    const allRecords = await this.getAllRecords();
    const allRecordsSorted = this.sortRecordsByTime(allRecords);

    const getRawRecordsQuery = this.formatGetRawRecordsQuery(map, track, style, authId);
    const rawRecords = await this.prismaService.$queryRaw<RawRecord[]>(getRawRecordsQuery);

    const countryCodesDictionary = await this.getRecordsCountryCodesDictionary(rawRecords);

    const mappedRecords = rawRecords.map((rawRecord): RecordDTO => {
      const topForRecord = this.getRecordsMapTop(allRecordsSorted, rawRecord.map, rawRecord.track, rawRecord.style);

      const position = topForRecord.findIndex((record) => record.id === rawRecord.id) + 1;

      const [user1, user2] = this.getRecordUsers(rawRecord);
      const [countryCode1, countryCode2] = this.getRecordUsersCountryCodes(rawRecord, countryCodesDictionary);

      return convertRawRecordToRecord(rawRecord, position, user1, user2, countryCode1, countryCode2);
    });

    return mappedRecords;
  }

  async getRecordDetails(id: number): Promise<RecordDetailsDTO | null> {
    const getRawRecordByIdQuery = this.formatGetRawRecordByIdQuery(id);
    const rawRecords = await this.prismaService.$queryRaw<RawRecord[]>(getRawRecordByIdQuery);

    // рекорд по заданному id не найден
    if (rawRecords.length === 0) {
      return null;
    }

    const rawRecord = rawRecords[0];
    const { map, jumps, style, completions } = rawRecord;

    const allRecords = await this.getAllRecords();
    const allRecordsSorted = this.sortRecordsByTime(allRecords);

    const topForRecord = this.getRecordsMapTop(allRecordsSorted, rawRecord.map, rawRecord.track, rawRecord.style);
    const position = topForRecord.findIndex((record) => record.id === rawRecord.id) + 1;
    const totalPlaces = topForRecord.length;

    const countryCodesDictionary = await this.getRecordsCountryCodesDictionary([rawRecord]);

    const $group = this.skillrankServiceClient.send<number | null, SkillrankGetRecordGroupPayload>(
      SKILLRANK_GET_RECORD_GROUP_CMD,
      { totalRecords: totalPlaces, position },
    );
    const $points = this.skillrankServiceClient.send<number, SkillrankGetRecordPointsPayload>(
      SKILLRANK_GET_RECORD_POINTS_CMD,
      {
        totalRecords: totalPlaces,
        position,
        map,
        style,
      },
    );

    const [group, points] = await Promise.all([lastValueFrom($group), lastValueFrom($points)]);

    const [user1, user2] = this.getRecordUsers(rawRecord);
    const [countryCode1, countryCode2] = this.getRecordUsersCountryCodes(rawRecord, countryCodesDictionary);

    const recordDto = convertRawRecordToRecord(rawRecord, position, user1, user2, countryCode1, countryCode2);

    const skillRank: RecordSkillRankDTO = {
      points,
      group: group ?? 0,
    };

    return {
      ...recordDto,
      jumps,
      completions,
      totalPlaces,
      skillRank,
    };
  }

  async getMapBestTimes(): Promise<MapBestTimeDTO[]> {
    const groupedMapTimes = await this.prismaService.playertime.groupBy({
      by: ["map", "track", "style"],
      _min: {
        time: true,
      },
    });

    const mapBestTimes = groupedMapTimes
      .map((mapTime): MapBestTimeDTO | null => {
        const { _min, ...rest } = mapTime;
        if (!_min.time) return null;

        return {
          ...rest,
          time: _min.time,
        };
      })
      .filter(isDefined);

    return mapBestTimes;
  }

  private async getAllRecords() {
    const allRecords = await this.prismaService.playertime.findMany();
    return allRecords;
  }

  private sortRecordsByTime(records: Playertime[]) {
    const sortedRecords = [...records].sort((a, b) => Number(a.time) - Number(b.time));
    return sortedRecords;
  }

  private getRecordsMapTop(allRecords: Playertime[], map: string, track: number, style: number) {
    const mapTop = allRecords.filter((record) => {
      const isSameMap = record.map === map;
      const isSameTrack = record.track === track;
      const isSameStyle = record.style === style;
      return isSameMap && isSameTrack && isSameStyle;
    });
    return mapTop;
  }

  private getRecordUsers(record: RawRecord): [RawUser, RawUser] {
    const user1: RawUser = {
      auth: record.user1_auth,
      name: record.user1_name,
      ip: record.user1_ip,
      lastlogin: record.user1_lastlogin,
    };
    const user2: RawUser = {
      auth: record.user2_auth,
      name: record.user2_name,
      ip: record.user2_ip,
      lastlogin: record.user2_lastlogin,
    };

    return [user1, user2];
  }

  private getRecordUsersCountryCodes(
    record: RawRecord,
    countryCodesDictionary: CountryCodesDictionary,
  ): [string | null, string | null] {
    const user1Ip = record?.user1_ip;
    const user2Ip = record?.user2_ip;

    const countryCode1 = user1Ip ? countryCodesDictionary.get(user1Ip) ?? null : null;
    const countryCode2 = user2Ip ? countryCodesDictionary.get(user2Ip) ?? null : null;

    return [countryCode1, countryCode2];
  }

  private formatGetRawRecordsQuery(
    map: string | undefined,
    track: number | undefined,
    style: number | undefined,
    authId: number | undefined,
  ) {
    return Prisma.sql`
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
  }

  private formatGetRawRecordByIdQuery(id: number) {
    return Prisma.sql`
      SELECT p.*,
        u1.auth as user1_auth, u1.name as user1_name, u1.ip as user1_ip, u1.lastlogin as user1_lastlogin,
        u2.auth as user2_auth, u2.name as user2_name, u2.ip as user2_ip, u2.lastlogin as user2_lastlogin
      FROM playertimes p
      JOIN users u1 ON p.auth = u1.auth
      JOIN users u2 ON p.auth2 = u2.auth
      WHERE p.id = ${id}
    `;
  }

  private async getRecordsCountryCodesDictionary(records: RawRecord[]): Promise<CountryCodesDictionary> {
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
