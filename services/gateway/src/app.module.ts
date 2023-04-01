import { Module } from "@nestjs/common";
import { ApiModule, SkillrankModule } from "modules";

@Module({
  imports: [ApiModule, SkillrankModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
