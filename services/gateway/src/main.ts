import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters";
import { HostGuard } from "./guards";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new HostGuard());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
