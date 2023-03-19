import { Module } from "@nestjs/common";
import { MapsModule } from "modules/maps";
import { RecordsModule } from "modules/records";

@Module({
  imports: [RecordsModule, MapsModule],
})
export class AppModule {}
