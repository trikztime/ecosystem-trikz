import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  API_GET_MAP_BEST_TIMES_CMD,
  API_GET_MAP_BY_NAME_CMD,
  API_GET_MAPS_LIST_CMD,
  API_GET_PLAYER_BY_AUTH_CMD,
  API_GET_PLAYERS_LIST_CMD,
  API_GET_RECORD_DETAILS_CMD,
  API_GET_RECORDS_LIST_CMD,
  ApiGetMapByNameMessagePayload,
  ApiGetPlayerByAuthMessagePayload,
  ApiGetRecordDetailsMessagePayload,
  ApiGetRecordsListMessagePayload,
  STEAM_GET_AUTH_AVATARS_CMD,
  SteamGetAuthAvatarsPayload,
} from "@trikztime/ecosystem-shared/const";
import { MapBestTimeDTO, MapDTO, PlayerDTO, RecordDetailsDTO, RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ApiService {
  constructor(
    @Inject(configService.config?.api.serviceToken) private apiServiceClient: ClientProxy,
    @Inject(configService.config?.steam.serviceToken) private steamServiceClient: ClientProxy,
  ) {}

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

  async getRecordDetails(payload: ApiGetRecordDetailsMessagePayload) {
    const $stream = this.apiServiceClient.send<RecordDetailsDTO, ApiGetRecordDetailsMessagePayload>(
      API_GET_RECORD_DETAILS_CMD,
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

  async getPlayersList() {
    const $stream = this.apiServiceClient.send<PlayerDTO[]>(API_GET_PLAYERS_LIST_CMD, {});
    return await lastValueFrom($stream);
  }

  async getPlayerByAuth(payload: ApiGetPlayerByAuthMessagePayload) {
    const $stream = this.apiServiceClient.send<PlayerDTO | null, ApiGetPlayerByAuthMessagePayload>(
      API_GET_PLAYER_BY_AUTH_CMD,
      payload,
    );
    return await lastValueFrom($stream);
  }

  async getPlayerAvatars(payload: SteamGetAuthAvatarsPayload) {
    const $stream = this.steamServiceClient.send<Record<number, string>, SteamGetAuthAvatarsPayload>(
      STEAM_GET_AUTH_AVATARS_CMD,
      payload,
    );
    return await lastValueFrom($stream);
  }
}
