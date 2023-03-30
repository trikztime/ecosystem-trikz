import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { configService } from "@trikztime/ecosystem-shared/config";

import { SocketModule } from "./socket.module";

async function bootstrap() {
  const config = configService.config?.gatewaySocket;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SocketModule, {
    transport: Transport.TCP,
    options: {
      host: config?.serviceHost,
      port: config?.servicePort,
    },
  });
  await app.listen();
}
bootstrap();
