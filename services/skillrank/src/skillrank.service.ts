import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  API_GET_MAP_BY_NAME_CMD,
  API_GET_MAPS_LIST_CMD,
  API_GET_RECORDS_LIST_CMD,
  ApiGetMapByNameMessagePayload,
  ApiGetRecordsListMessagePayload,
  StyleCodes,
  TrackCodes,
} from "@trikztime/ecosystem-shared/const";
import { MapDTO, RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { EventQueue, isDefined } from "@trikztime/ecosystem-shared/utils";
import { PrismaService } from "modules/prisma";
import { lastValueFrom } from "rxjs";
import { getGroupSizes, getPlaceGroupIndex, getRecordWeightedPoints } from "utils/groups";
import { getMapSkillPoints } from "utils/points";

interface IRecalculatedSkillrank {
  auth: number;
  map: string;
  style: number;
  points: number;
}

const skillrankQueue = new EventQueue<true | null>();

@Injectable()
export class SkillrankService {
  constructor(
    @Inject(configService.config?.api.serviceToken) private apiServiceClient: ClientProxy,
    private prismaService: PrismaService,
  ) {}

  async recalculateAllMaps() {
    const taskPromise = new Promise<true | null>((resolve, reject) => {
      skillrankQueue.addEvent(
        () => this.recalculateAllTask(),
        (result) => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(result ?? null);
          }
        },
      );
    }).catch((error) => {
      // TODO заменить на логгер
      // eslint-disable-next-line no-console
      console.error(error);
    });

    return await taskPromise;
  }

  async recalculateMap(map: string, style: number) {
    const taskPromise = new Promise<true | null>((resolve, reject) => {
      skillrankQueue.addEvent(
        () => this.recalculateMapTask(map, style),
        (result) => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(result ?? null);
          }
        },
      );
    }).catch((error) => {
      // TODO заменить на логгер
      // eslint-disable-next-line no-console
      console.error(error);
    });

    return await taskPromise;
  }

  getRecordGroup(totalRecords: number, position: number) {
    const groupSizes = getGroupSizes(totalRecords);
    const groupIndex = getPlaceGroupIndex(position, groupSizes);

    return groupIndex !== null ? groupIndex + 1 : null;
  }

  async getRecordPoints(totalRecords: number, position: number, map: string, style: number) {
    const $mapInfo = this.apiServiceClient.send<MapDTO | null, ApiGetMapByNameMessagePayload>(API_GET_MAP_BY_NAME_CMD, {
      name: map,
    });
    const mapInfo = await lastValueFrom($mapInfo);

    if (!mapInfo) {
      return 0;
    }

    const { tier, basePoints } = mapInfo;
    const skillPoints = getMapSkillPoints(tier, basePoints);
    const groupSizes = getGroupSizes(totalRecords);

    return getRecordWeightedPoints(position, groupSizes, skillPoints, style);
  }

  private async recalculateAllTask(): Promise<true | null> {
    const $allRecords = this.apiServiceClient.send<RecordDTO[], ApiGetRecordsListMessagePayload>(
      API_GET_RECORDS_LIST_CMD,
      {
        track: TrackCodes.main,
      },
    );
    const $allMaps = this.apiServiceClient.send<MapDTO[]>(API_GET_MAPS_LIST_CMD, {});

    const [records, maps] = await Promise.all([lastValueFrom($allRecords), lastValueFrom($allMaps)]);

    const mappedSkillrank: IRecalculatedSkillrank[] = [];

    // формирование массивов skillrank по каждой карте и каждому стилю
    maps.forEach((mapObject) => {
      const mapName = mapObject.map;
      const mapRecords = records.filter((record) => record.map === mapName);
      const normalRecords = mapRecords.filter((record) => record.style === StyleCodes.normal);
      const sidewaysRecords = mapRecords.filter((record) => record.style === StyleCodes.sideways);
      const wonlyRecords = mapRecords.filter((record) => record.style === StyleCodes.wonly);

      const normalSkillrank = this.getMappedSkillrankObjects(mapName, StyleCodes.normal, normalRecords, mapObject);
      const sidewaysSkillrank = this.getMappedSkillrankObjects(
        mapName,
        StyleCodes.sideways,
        sidewaysRecords,
        mapObject,
      );
      const wonlySkillrank = this.getMappedSkillrankObjects(mapName, StyleCodes.wonly, wonlyRecords, mapObject);

      mappedSkillrank.push(...normalSkillrank, ...sidewaysSkillrank, ...wonlySkillrank);
    });

    const transaction = this.prismaService.$transaction(async (prisma) => {
      // удаление всех данных из таблицы skillrank
      await prisma.skillRank.deleteMany();

      // заполнение новыми данными
      await prisma.skillRank.createMany({
        data: mappedSkillrank,
      });
    });

    await transaction;
    return true;
  }

  private async recalculateMapTask(map: string, style: number): Promise<true | null> {
    const $records = this.apiServiceClient.send<RecordDTO[], ApiGetRecordsListMessagePayload>(
      API_GET_RECORDS_LIST_CMD,
      {
        map,
        style,
        track: TrackCodes.main,
      },
    );
    const $map = this.apiServiceClient.send<MapDTO | null, ApiGetMapByNameMessagePayload>(API_GET_MAP_BY_NAME_CMD, {
      name: map,
    });

    const [records, mapInfo] = await Promise.all([lastValueFrom($records), lastValueFrom($map)]);

    if (!mapInfo) return null;

    const mappedSkillrank = this.getMappedSkillrankObjects(map, style, records, mapInfo);

    const transaction = this.prismaService.$transaction(async (prisma) => {
      // удаление прошлых записей по карте
      await prisma.skillRank.deleteMany({
        where: {
          map,
          style,
        },
      });

      // заполнение новыми данными
      await prisma.skillRank.createMany({
        data: mappedSkillrank,
      });
    });

    await transaction;
    return true;
  }

  private getMappedSkillrankObjects(map: string, style: number, records: RecordDTO[], mapInfo: MapDTO) {
    const { tier, basePoints } = mapInfo;
    const groupSizes = getGroupSizes(records.length);
    const skillPoints = getMapSkillPoints(tier, basePoints);
    const sortedRecords = [...records].sort((a, b) => Number(a?.time) - Number(b?.time));

    const recordIdToPlaceMap = new Map<number, number>();
    const bestAuthRecordMap = new Map<number, RecordDTO>();

    const updateAuthBestRecord = (auth: number, record: RecordDTO) => {
      const bestRecord = bestAuthRecordMap.get(auth);
      if (bestRecord && Number(record.time) < Number(bestRecord.time)) {
        bestAuthRecordMap.set(auth, record);
      } else if (!bestRecord) {
        bestAuthRecordMap.set(auth, record);
      }
    };

    sortedRecords.forEach((record, index) => {
      // маппинг id -> place
      recordIdToPlaceMap.set(record.id, index + 1);

      // маппинг auth -> record
      const auth1 = record.player1.auth;
      const auth2 = record.player2?.auth;
      updateAuthBestRecord(auth1, record);
      auth2 && updateAuthBestRecord(auth2, record);
    });

    const mappedSkillrank = Array.from(bestAuthRecordMap.entries())
      .map(([auth, record]): IRecalculatedSkillrank | null => {
        const place = recordIdToPlaceMap.get(record.id);

        if (!isDefined(style) || !place) return null;

        return {
          auth,
          map,
          style,
          points: getRecordWeightedPoints(place, groupSizes, skillPoints, style),
        };
      })
      .filter(isDefined);

    return mappedSkillrank;
  }
}
