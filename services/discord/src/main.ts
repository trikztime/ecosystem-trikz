import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";

import { DiscordModule } from "./discord.module";

async function bootstrap() {
  const config = configService.config?.discord;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(DiscordModule, {
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  });
  await app.listen();
}
bootstrap();
