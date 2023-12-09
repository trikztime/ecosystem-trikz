import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  API_GET_MAP_BEST_TIMES_CMD,
  API_GET_RECORD_DETAILS_CMD,
  API_GET_RECORDS_COUNT_CMD,
  API_GET_RECORDS_LIST_CMD,
  ApiGetRecordDetailsMessagePayload,
  ApiGetRecordsCountMessagePayload,
  ApiGetRecordsListMessagePayload,
} from "@trikztime/ecosystem-shared/const";
import { MapBestTimeDTO, RecordDetailsDTO, RecordDTO } from "@trikztime/ecosystem-shared/dto";

import { RecordsService } from "./records.service";

@Controller()
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @MessagePattern(API_GET_RECORDS_LIST_CMD)
  async getRecordsList(@Payload() payload: ApiGetRecordsListMessagePayload): Promise<RecordDTO[]> {
    const { map, track, style, authId } = payload;
    return await this.recordsService.getRecords(map, track, style, authId);
  }

  @MessagePattern(API_GET_RECORDS_COUNT_CMD)
  async getRecordsCount(@Payload() payload: ApiGetRecordsCountMessagePayload): Promise<number> {
    const { map, track, style, authId } = payload;
    return await this.recordsService.getRecordsCount(map, track, style, authId);
  }

  @MessagePattern(API_GET_RECORD_DETAILS_CMD)
  async getRecordDetails(@Payload() payload: ApiGetRecordDetailsMessagePayload): Promise<RecordDetailsDTO | null> {
    const { id } = payload;
    return await this.recordsService.getRecordDetails(id);
  }

  @MessagePattern(API_GET_MAP_BEST_TIMES_CMD)
  async getMapBestTimes(): Promise<MapBestTimeDTO[]> {
    return await this.recordsService.getMapBestTimes();
  }
}
