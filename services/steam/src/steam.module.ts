import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";
import { PrismaModule } from "modules/prisma";
import { SteamController } from "steam.controller";
import { SteamService } from "steam.service";

@Module({
  imports: [PrismaModule, ClientsRegisterModule],
  controllers: [SteamController],
  providers: [SteamService],
})
export class SteamModule {}
