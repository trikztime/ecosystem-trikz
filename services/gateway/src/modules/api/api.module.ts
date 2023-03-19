import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";

import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";

@Module({
  imports: [ClientsRegisterModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
