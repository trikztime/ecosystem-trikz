import { Module } from "@nestjs/common";
import { PrismaModule } from "modules/prisma";

import { MapsController } from "./maps.controller";
import { MapsService } from "./maps.service";

@Module({
  imports: [PrismaModule],
  controllers: [MapsController],
  providers: [MapsService],
})
export class MapsModule {}
