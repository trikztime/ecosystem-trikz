import { Module } from "@nestjs/common/";
import { ApiModule, SkillrankModule, SocketModule } from "modules";

@Module({
  imports: [ApiModule, SkillrankModule, SocketModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
