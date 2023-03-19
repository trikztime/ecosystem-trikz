import { Module } from "@nestjs/common";
import { PrismaModule } from "modules/prisma";

import { RecordsController } from "./records.controller";
import { RecordsService } from "./records.service";

@Module({
  imports: [PrismaModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
