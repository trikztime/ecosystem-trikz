import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";
import path from "path";

import { SkillrankModule } from "./skillrank.module";

async function bootstrap() {
  await configService.initialize(path.join(__dirname, "config/config.json"));
  const config = configService.config?.skillrank;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SkillrankModule, {
    transport: Transport.TCP,
    options: {
      host: config?.microserviceHost,
      port: config?.microservicePort,
    },
  });
  await app.listen();
}
bootstrap();
