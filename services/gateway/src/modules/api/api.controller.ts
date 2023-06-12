import { Controller, Get, Param, Query } from "@nestjs/common";
import { createResponse, isDefined } from "@trikztime/ecosystem-shared/utils";

import { ApiService } from "./api.service";

@Controller({ path: "api", version: "1" })
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get("record/list")
  async getRecords(
    @Query("map") map?: string,
    @Query("track") track?: string,
    @Query("style") style?: string,
    @Query("authId") authId?: number,
  ) {
    const trackNumber = isDefined(track) ? Number(track) : undefined;
    const styleNumnber = isDefined(style) ? Number(style) : undefined;
    const authNumber = isDefined(authId) ? Number(authId) : undefined;

    const records = await this.apiService.getRecordsList({
      map,
      track: trackNumber,
      style: styleNumnber,
      authId: authNumber,
    });
    return createResponse("ok", records);
  }

  @Get("record/best-times")
  async getMapBestTimes() {
    const mapBestTimes = await this.apiService.getMapBestTimes();
    return createResponse("ok", mapBestTimes);
  }

  @Get("record/:id")
  async getRecordDetails(@Param("id") id: number) {
    const recordDetails = await this.apiService.getRecordDetails({ id });
    return createResponse("ok", recordDetails);
  }

  @Get("map/list")
  async getMaps() {
    const maps = await this.apiService.getMapsList();
    return createResponse("ok", maps);
  }

  @Get("map/:name")
  async getMapByName(@Param("name") name: string) {
    const map = await this.apiService.getMapByName({ name });
    return createResponse("ok", map);
  }

  @Get("player/list")
  async getPlayers() {
    const players = await this.apiService.getPlayersList();
    return createResponse("ok", players);
  }

  @Get("player/:auth")
  async getPlayerByAuth(@Param("auth") auth: number) {
    const player = await this.apiService.getPlayerByAuth({ authId: auth });
    return createResponse("ok", player);
  }
}
