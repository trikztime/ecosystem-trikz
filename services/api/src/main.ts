import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import path from "path";

import { AppModule } from "./app.module";

async function bootstrap() {
  await configService.initialize(path.join(__dirname, "config/config.json"));
  const config = configService.config?.api;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: config?.microserviceHost,
      port: config?.microservicePort,
    },
  });

  await app.listen();
}
bootstrap();
