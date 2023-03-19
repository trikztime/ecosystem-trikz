import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  SKILLRANK_RECALCULATE_ALL_CMD,
  SKILLRANK_RECALCULATE_MAP_CMD,
  SkillrankRecalculateMapPayload,
} from "@trikztime/ecosystem-shared/const";
import { SkillrankService } from "skillrank.service";

@Controller()
export class SkillrankController {
  constructor(private service: SkillrankService) {}

  @MessagePattern({ cmd: SKILLRANK_RECALCULATE_ALL_CMD })
  async recalculateAll() {
    return this.service.recalculateAllMaps();
  }

  @MessagePattern({ cmd: SKILLRANK_RECALCULATE_MAP_CMD })
  async recalculateMap(@Payload() payload: SkillrankRecalculateMapPayload) {
    const { map, style } = payload;
    return this.service.recalculateMap(map, style);
  }
}
