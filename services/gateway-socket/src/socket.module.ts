import { Module } from "@nestjs/common";
import { ClientsRegisterModule } from "@trikztime/ecosystem-shared/nest";

import { SocketController } from "./socket.controller";
import { SocketService } from "./socket.service";

@Module({
  imports: [ClientsRegisterModule],
  controllers: [SocketController],
  providers: [SocketService],
})
export class SocketModule {}
