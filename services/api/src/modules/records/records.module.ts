import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";
import { PrismaModule } from "modules/prisma";

import { RecordsController } from "./records.controller";
import { RecordsService } from "./records.service";

@Module({
  imports: [PrismaModule, ClientsRegisterModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
