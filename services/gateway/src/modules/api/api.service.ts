import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  API_GET_MAP_BEST_TIMES_CMD,
  API_GET_MAP_BY_NAME_CMD,
  API_GET_MAPS_LIST_CMD,
  API_GET_RECORDS_LIST_CMD,
  ApiGetMapByNameMessagePayload,
  ApiGetRecordsListMessagePayload,
} from "@trikztime/ecosystem-shared/const";
import { MapBestTimeDTO, MapDTO, RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ApiService {
  constructor(@Inject(configService.config?.api.serviceToken) private apiServiceClient: ClientProxy) {}

  async healthCheck() {
    return true;
  }

  async getRecordsList(payload: ApiGetRecordsListMessagePayload) {
    const $stream = this.apiServiceClient.send<RecordDTO[], ApiGetRecordsListMessagePayload>(
      API_GET_RECORDS_LIST_CMD,
      payload,
    );
    return await lastValueFrom($stream);
  }

  async getMapBestTimes() {
    const $stream = this.apiServiceClient.send<MapBestTimeDTO[]>(API_GET_MAP_BEST_TIMES_CMD, {});
    return await lastValueFrom($stream);
  }

  async getMapsList() {
    const $stream = this.apiServiceClient.send<MapDTO[]>(API_GET_MAPS_LIST_CMD, {});
    return await lastValueFrom($stream);
  }

  async getMapByName(payload: ApiGetMapByNameMessagePayload) {
    const $stream = this.apiServiceClient.send<MapDTO | null, ApiGetMapByNameMessagePayload>(
      API_GET_MAP_BY_NAME_CMD,
      payload,
    );
    return await lastValueFrom($stream);
  }
}
