import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  API_GET_MAP_BY_NAME_CMD,
  API_GET_MAPS_COUNT_CMD,
  API_GET_MAPS_LIST_CMD,
  ApiGetMapByNameMessagePayload,
} from "@trikztime/ecosystem-shared/const";
import { MapDTO } from "@trikztime/ecosystem-shared/dto";

import { MapsService } from "./maps.service";

@Controller()
export class MapsController {
  constructor(private mapsService: MapsService) {}

  @MessagePattern(API_GET_MAPS_LIST_CMD)
  async getMapsList(): Promise<MapDTO[]> {
    return await this.mapsService.getMapsList();
  }

  @MessagePattern(API_GET_MAPS_COUNT_CMD)
  async getMapsCount(): Promise<number> {
    return await this.mapsService.getMapsCount();
  }

  @MessagePattern(API_GET_MAP_BY_NAME_CMD)
  async getMapByName(@Payload() payload: ApiGetMapByNameMessagePayload): Promise<MapDTO | null> {
    return await this.mapsService.getMapByName(payload.name);
  }
}
