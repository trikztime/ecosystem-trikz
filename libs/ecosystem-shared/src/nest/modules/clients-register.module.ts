import { Module } from "@nestjs/common/";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { configService } from "../../config";

const config = configService.config;
const api = config?.api;
const skillrank = config?.skillrank;

const registeredClientsModule = ClientsModule.register([
  {
    name: api?.serviceToken ?? "api",
    transport: Transport.TCP,
    options: {
      host: api?.serviceHost,
      port: api?.servicePort,
    },
  },
  {
    name: skillrank?.serviceToken ?? "skillrank",
    transport: Transport.TCP,
    options: {
      host: skillrank?.serviceHost,
      port: skillrank?.servicePort,
    },
  },
]);

@Module({
  imports: [registeredClientsModule],
  exports: [registeredClientsModule],
})
export class ClientsRegisterModule {}
