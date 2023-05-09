import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  API_GET_MAP_BEST_TIMES_CMD,
  API_GET_RECORDS_CMD,
  ApiGetRecordsMessagePayload,
} from "@trikztime/ecosystem-shared/const";
import { MapBestTimeDTO, RecordDTO } from "@trikztime/ecosystem-shared/dto";

import { RecordsService } from "./records.service";

@Controller()
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @MessagePattern(API_GET_RECORDS_CMD)
  async getRecords(@Payload() payload: ApiGetRecordsMessagePayload): Promise<RecordDTO[]> {
    const { map, track, style, authId } = payload;
    return await this.recordsService.getRecords(map, track, style, authId);
  }

  @MessagePattern(API_GET_MAP_BEST_TIMES_CMD)
  async getMapBestTimes(): Promise<MapBestTimeDTO[]> {
    return await this.recordsService.getMapBestTimes();
  }
}
