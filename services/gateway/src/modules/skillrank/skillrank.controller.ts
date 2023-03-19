import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { createResponse, isDefined } from "@trikztime/ecosystem-shared/utils";

import { SkillrankService } from "./skillrank.service";
import { RecalculateMapRequest } from "./types";

@Controller("skillrank/v1")
export class SkillrankController {
  constructor(private skillrankService: SkillrankService) {}

  @Post("recalculate-map")
  async recalculateMap(@Body() body: Partial<RecalculateMapRequest>) {
    const { map, style } = body;

    if (!isDefined(map) || !isDefined(style)) throw new BadRequestException("Missing body properties (map, style)");

    const result = await this.skillrankService.recalculateMap({ map, style: Number(style) });
    return createResponse("ok", result);
  }

  @Post("recalculate-all")
  async recalculateAll() {
    const result = await this.skillrankService.recalculateAll();
    return createResponse("ok", result);
  }
}
