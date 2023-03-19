import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { serviceConfig } from "@trikztime/ecosystem-shared/const";

import { SkillrankModule } from "./skillrank.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SkillrankModule, {
    transport: Transport.TCP,
    options: {
      host: serviceConfig.skillrank.host,
      port: serviceConfig.skillrank.port,
    },
  });
  await app.listen();
}
bootstrap();
