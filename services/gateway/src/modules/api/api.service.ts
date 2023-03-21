import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  API_GET_MAP_BY_NAME_CMD,
  API_GET_MAPS_CMD,
  API_GET_RECORDS_CMD,
  ApiGetMapByNameMessagePayload,
  ApiGetRecordsMessagePayload,
} from "@trikztime/ecosystem-shared/const";
import { MapDTO, RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ApiService {
  constructor(@Inject(configService.config?.api.microserviceToken) private apiServiceClient: ClientProxy) {}

  async healthCheck() {
    return true;
  }

  async getRecords(payload: ApiGetRecordsMessagePayload) {
    const $stream = this.apiServiceClient.send<RecordDTO[], ApiGetRecordsMessagePayload>(
      { cmd: API_GET_RECORDS_CMD },
      payload,
    );
    return await lastValueFrom($stream);
  }

  async getMaps() {
    const $stream = this.apiServiceClient.send<MapDTO[]>({ cmd: API_GET_MAPS_CMD }, {});
    return await lastValueFrom($stream);
  }

  async getMapByName(payload: ApiGetMapByNameMessagePayload) {
    const $stream = this.apiServiceClient.send<MapDTO | null, ApiGetMapByNameMessagePayload>(
      { cmd: API_GET_MAP_BY_NAME_CMD },
      payload,
    );
    return await lastValueFrom($stream);
  }
}
