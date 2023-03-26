import { Module } from "@nestjs/common/";
import { ClientProviderOptions, ClientsModule, Transport } from "@nestjs/microservices";

import { configService } from "../../config";
import { CommonMicroserviceConfig } from "../../config/types";

const getMicroserviceConfig = (
  config: CommonMicroserviceConfig | undefined,
  defaultToken: string,
): ClientProviderOptions => {
  return {
    name: config?.serviceToken ?? defaultToken,
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  };
};

const config = configService.config;

const registeredClientsModule = ClientsModule.register([
  getMicroserviceConfig(config?.gateway, "gateway"),
  getMicroserviceConfig(config?.api, "api"),
  getMicroserviceConfig(config?.skillrank, "skillrank"),
  getMicroserviceConfig(config?.discord, "discord"),
]);

@Module({
  imports: [registeredClientsModule],
  exports: [registeredClientsModule],
})
export class ClientsRegisterModule {}
