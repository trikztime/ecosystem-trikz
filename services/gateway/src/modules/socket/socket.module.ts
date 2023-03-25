import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";

import { SocketService } from "./socket.service";

@Module({
  imports: [ClientsRegisterModule],
  controllers: [],
  providers: [SocketService],
})
export class SocketModule {}
