import { Module } from "@nestjs/common";
import { MapsModule } from "modules/maps";
import { PlayersModule } from "modules/players";
import { RecordsModule } from "modules/records";

@Module({
  imports: [RecordsModule, MapsModule, PlayersModule],
})
export class AppModule {}
