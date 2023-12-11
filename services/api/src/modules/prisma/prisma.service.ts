import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    const maps = await this.map.findMany();
    const zones = await this.mapzone.findMany();
    const records = await this.playertime.findMany();
    const logRecords = await this.logPlayertime.findMany();

    // get map ids
    const mapsDict = new Map<string, number>();
    const deletedMaps = new Set<string>();
    maps.forEach((map, index) => {
      mapsDict.set(map.map.toLowerCase(), index + 1);
    });

    // update map.id/map.name
    const mapUpdates = maps.map((map) => {
      const mapName = map.map.toLowerCase();
      return this.map.update({
        data: {
          name: mapName,
          id: mapsDict.get(mapName),
        },
        where: {
          map: map.map,
        },
      });
    });
    await Promise.all(mapUpdates);

    // update/delete mapzones
    const zoneUpdates = zones.map((zone) => {
      if (!zone.map) return null;
      const mapName = zone.map.toLowerCase();
      const mapId = mapsDict.get(mapName);

      if (!mapId) {
        deletedMaps.add(mapName);
        return this.mapzone.delete({
          where: {
            id: zone.id,
          },
        });
      }

      return this.mapzone.update({
        data: {
          mapId,
        },
        where: {
          id: zone.id,
        },
      });
    });
    await Promise.all(zoneUpdates);

    // update/delete playertimes
    const recordUpdates = records.map((record) => {
      const mapName = record.map.toLowerCase();
      const mapId = mapsDict.get(mapName);

      if (!mapId) {
        deletedMaps.add(mapName);
        return this.playertime.delete({
          where: {
            id: record.id,
          },
        });
      }

      return this.playertime.update({
        data: {
          mapId,
        },
        where: {
          id: record.id,
        },
      });
    });
    await Promise.all(recordUpdates);

    // update/delete log_playertimes
    const logRecordUpdates = logRecords.map((record) => {
      if (!record.map) return null;
      const mapName = record.map.toLowerCase();
      const mapId = mapsDict.get(mapName);

      if (!mapId) {
        deletedMaps.add(mapName);
        return this.logPlayertime.delete({
          where: {
            id: record.id,
          },
        });
      }

      return this.logPlayertime.update({
        data: {
          mapId,
        },
        where: {
          id: record.id,
        },
      });
    });
    await Promise.all(logRecordUpdates);

    console.info("migration done");
    console.info("deleted maps:", Array.from(deletedMaps).join(", "));
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
