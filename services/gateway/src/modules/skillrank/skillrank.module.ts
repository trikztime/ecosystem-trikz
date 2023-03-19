import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";

import { SkillrankController } from "./skillrank.controller";
import { SkillrankService } from "./skillrank.service";

@Module({
  imports: [ClientsRegisterModule],
  controllers: [SkillrankController],
  providers: [SkillrankService],
})
export class SkillrankModule {}
