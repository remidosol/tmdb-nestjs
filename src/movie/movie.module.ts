import { Module } from "@nestjs/common";
import { MovieService } from "./movie.service";
import { MovieController } from "./movie.controller";
import { ConfigModule } from "../config/config.module";
import { MongooseModule } from "@nestjs/mongoose";
import { MovieSchemaProvider } from "./movie.provider";
import { MovieResolver } from "./movie.resolver";
import { MovieRepository } from "./movie.repository";

@Module({
  imports: [MongooseModule.forFeatureAsync([MovieSchemaProvider]), ConfigModule],
  providers: [MovieService, MovieResolver, MovieRepository],
  controllers: [MovieController],
  exports: [MovieService, MovieResolver, MovieRepository],
})
export class MovieModule {}
