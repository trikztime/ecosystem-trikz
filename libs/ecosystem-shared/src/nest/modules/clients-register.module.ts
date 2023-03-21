import { Module } from "@nestjs/common/";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { configService } from "../../config";

const config = configService.config;

const registeredClientsModule = ClientsModule.register([
  {
    name: config?.api.microserviceToken ?? "api",
    transport: Transport.TCP,
    options: {
      host: config?.api.microserviceHost,
      port: config?.api.microservicePort,
    },
  },
  {
    name: config?.skillrank.microserviceToken ?? "skillrank",
    transport: Transport.TCP,
    options: {
      host: config?.skillrank.microserviceHost,
      port: config?.skillrank.microservicePort,
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
