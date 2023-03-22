import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import {
  SKILLRANK_RECALCULATE_ALL_CMD,
  SKILLRANK_RECALCULATE_MAP_CMD,
  SkillrankRecalculateMapPayload,
} from "@trikztime/ecosystem-shared/const";
import { lastValueFrom } from "rxjs";

@Injectable()
export class SkillrankService {
  constructor(@Inject(configService.config?.skillrank.serviceToken) private skillrankServiceClient: ClientProxy) {}

  async healthCheck() {
    return true;
  }

  async recalculateMap(payload: SkillrankRecalculateMapPayload) {
    const $stream = this.skillrankServiceClient.send<true | null, SkillrankRecalculateMapPayload>(
      { cmd: SKILLRANK_RECALCULATE_MAP_CMD },
      payload,
    );
    return await lastValueFrom($stream);
  }

  async recalculateAll() {
    const $stream = this.skillrankServiceClient.send<true | null>({ cmd: SKILLRANK_RECALCULATE_ALL_CMD }, {});
    return await lastValueFrom($stream);
  }
}
