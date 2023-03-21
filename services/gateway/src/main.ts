import { NestFactory } from "@nestjs/core";
import { configService } from "@trikztime/ecosystem-shared/config";
import path from "path";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters";

async function bootstrap() {
  await configService.initialize(path.join(__dirname, "config/config.json"));

  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
