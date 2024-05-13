import { Module } from "@nestjs/common";
import { TmdbApiService } from "./tmdb-api.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [TmdbApiService],
  exports: [TmdbApiService]
})
export class TmdbApiModule {}
