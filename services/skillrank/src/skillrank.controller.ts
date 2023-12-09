import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  SKILLRANK_GET_RECORD_GROUP_CMD,
  SKILLRANK_GET_RECORD_POINTS_CMD,
  SKILLRANK_RECALCULATE_ALL_CMD,
  SKILLRANK_RECALCULATE_MAP_CMD,
  SkillrankGetRecordGroupPayload,
  SkillrankGetRecordPointsPayload,
  SkillrankRecalculateMapPayload,
} from "@trikztime/ecosystem-shared/const";
import { SkillrankService } from "skillrank.service";

@Controller()
export class SkillrankController {
  constructor(private service: SkillrankService) {}

  @MessagePattern(SKILLRANK_RECALCULATE_ALL_CMD)
  async recalculateAll() {
    return this.service.recalculateAllMaps();
  }

  @MessagePattern(SKILLRANK_RECALCULATE_MAP_CMD)
  async recalculateMap(@Payload() payload: SkillrankRecalculateMapPayload) {
    const { map, style } = payload;
    return this.service.recalculateMap(map, style);
  }

  @MessagePattern(SKILLRANK_GET_RECORD_GROUP_CMD)
  async getRecordGroup(@Payload() payload: SkillrankGetRecordGroupPayload) {
    const { totalRecords, position } = payload;
    return this.service.getRecordGroup(totalRecords, position);
  }

  @MessagePattern(SKILLRANK_GET_RECORD_POINTS_CMD)
  async getRecordPoints(@Payload() payload: SkillrankGetRecordPointsPayload) {
    const { totalRecords, position, map, style } = payload;
    return await this.service.getRecordPoints(totalRecords, position, map, style);
  }
}
