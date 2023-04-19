import { Controller, Get, Param, Query } from "@nestjs/common";
import { createResponse, isDefined } from "@trikztime/ecosystem-shared/utils";

import { ApiService } from "./api.service";

@Controller({ path: "api", version: "1" })
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get("record")
  async getRecords(@Query("map") map?: string, @Query("track") track?: string, @Query("style") style?: string) {
    const trackMumber = isDefined(track) ? Number(track) : undefined;
    const styleNumnber = isDefined(style) ? Number(style) : undefined;

    const records = await this.apiService.getRecords({
      map,
      track: trackMumber,
      style: styleNumnber,
    });
    return createResponse("ok", records);
  }

  @Get("map")
  async getMaps() {
    const maps = await this.apiService.getMaps();
    return createResponse("ok", maps);
  }

  @Get("map/:name")
  async getMapByName(@Param("name") name: string) {
    const map = await this.apiService.getMapByName({ name });
    return createResponse("ok", map);
  }
}
