import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";

import { SkillrankModule } from "./skillrank.module";

async function bootstrap() {
  const config = configService.config?.skillrank;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SkillrankModule, {
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  });
  await app.listen();
}
bootstrap();
