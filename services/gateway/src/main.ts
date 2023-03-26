import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters";

async function bootstrap() {
  const config = configService.config?.gateway;

  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
