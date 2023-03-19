import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";
import { PrismaModule } from "modules/prisma";
import { SkillrankController } from "skillrank.controller";
import { SkillrankService } from "skillrank.service";

@Module({
  imports: [PrismaModule, ClientsRegisterModule],
  controllers: [SkillrankController],
  providers: [SkillrankService],
})
export class SkillrankModule {}
