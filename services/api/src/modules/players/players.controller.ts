import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  API_GET_PLAYER_BY_AUTH_CMD,
  API_GET_PLAYERS_COUNT,
  API_GET_PLAYERS_LIST_CMD,
  ApiGetPlayerByAuthMessagePayload,
} from "@trikztime/ecosystem-shared/const";
import { PlayerDTO } from "@trikztime/ecosystem-shared/dto";

import { PlayersService } from "./players.service";

@Controller()
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @MessagePattern(API_GET_PLAYERS_LIST_CMD)
  async getPlayersList(): Promise<PlayerDTO[]> {
    return await this.playersService.getPlayersList();
  }

  @MessagePattern(API_GET_PLAYERS_COUNT)
  async getPlayersCount(): Promise<number> {
    return await this.playersService.getPlayersCount();
  }

  @MessagePattern(API_GET_PLAYER_BY_AUTH_CMD)
  async getPlayerByAuth(@Payload() payload: ApiGetPlayerByAuthMessagePayload): Promise<PlayerDTO | null> {
    const { authId } = payload;
    return await this.playersService.getPlayerByAuth(authId);
  }
}
