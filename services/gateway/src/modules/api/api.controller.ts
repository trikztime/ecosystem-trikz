import { BadRequestException, Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { createResponse, isDefined } from "@trikztime/ecosystem-shared/utils";

import { ApiService } from "./api.service";
import { GetPlayerAvatarsRequest } from "./types";

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
  async getRecordDetails(@Param("id") id: string) {
    const recordDetails = await this.apiService.getRecordDetails({ id: Number(id) });
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
  async getPlayerByAuth(@Param("auth") auth: string) {
    const player = await this.apiService.getPlayerByAuth({ authId: Number(auth) });
    return createResponse("ok", player);
  }

  @Post("player/avatars")
  async getPlayerAvatars(@Body() body: Partial<GetPlayerAvatarsRequest>) {
    const { steamIds3 } = body;

    if (!isDefined(steamIds3)) throw new BadRequestException("Missing body properties (steamIds3)");

    const result = await this.apiService.getPlayerAvatars({ steamIds3 });
    return createResponse("ok", result);
  }
}
