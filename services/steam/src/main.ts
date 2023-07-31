import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";

import { SteamModule } from "./steam.module";

async function bootstrap() {
  const config = configService.config?.steam;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SteamModule, {
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  });
  await app.listen();
}
bootstrap();
