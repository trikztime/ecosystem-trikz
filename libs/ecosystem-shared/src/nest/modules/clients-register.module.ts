import { Module } from "@nestjs/common/";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { serviceConfig } from "../../const";

const registeredClientsModule = ClientsModule.register([
  {
    name: serviceConfig.api.token,
    transport: Transport.TCP,
    options: {
      host: serviceConfig.api.host,
      port: serviceConfig.api.port,
    },
  },
  {
    name: serviceConfig.skillrank.token,
    transport: Transport.TCP,
    options: {
      host: serviceConfig.skillrank.host,
      port: serviceConfig.skillrank.port,
    },
  },
]);

@Module({
  imports: [registeredClientsModule],
  controllers: [],
  providers: [],
  exports: [registeredClientsModule],
})
export class ClientsRegisterModule {}
