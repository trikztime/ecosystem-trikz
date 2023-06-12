import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";
import { PrismaModule } from "modules/prisma";

import { PlayersController } from "./players.controller";
import { PlayersService } from "./players.service";

@Module({
  imports: [PrismaModule, ClientsRegisterModule],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
