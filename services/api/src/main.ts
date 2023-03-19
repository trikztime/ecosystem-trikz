import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { serviceConfig } from "@trikztime/ecosystem-shared/const";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: serviceConfig.api.host,
      port: serviceConfig.api.port,
    },
  });

  await app.listen();
}
bootstrap();
