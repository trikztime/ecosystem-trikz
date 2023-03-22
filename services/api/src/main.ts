import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";

import { AppModule } from "./app.module";

async function bootstrap() {
  const config = configService.config?.api;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  });

  await app.listen();
}
bootstrap();
