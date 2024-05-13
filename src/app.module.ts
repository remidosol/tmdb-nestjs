import { Logger as NestLogger, MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { MovieModule } from "./movie/movie.module";
import { TmdbApiModule } from "./tmdb-api/tmdb-api.module";
import { CsrfMiddleware, RequestIdMiddleware } from "./common/middlewares";
import { ConfigService } from "./config/config.service";
import { ThrottlerModule } from "@nestjs/throttler";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Logger } from "@apollo/utils.logger";
import { join } from "path";

@Module({
  imports: [
    ConfigModule,
    MovieModule,
    TmdbApiModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>("DATABASE_URL"),
        };
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        const getApolloLogger = () => {
          const logger = new NestLogger("GraphQL");

          const apolloLogger: Logger = {
            debug: logger.debug,
            info: logger.log,
            warn: logger.warn,
            error: logger.error,
          };

          return apolloLogger;
        };

        return {
          playground: true,
          logger: getApolloLogger(),
          typePaths: ["./**/*.graphql"],
          definitions: {
            path: join(process.cwd(), "src/graphql.ts"),
            outputAs: "interface",
          },
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: "default",
            ttl: +configService.getOrThrow("DEFAULT_THROTTLE_TTL"),
            limit: +configService.getOrThrow("DEFAULT_THROTTLE_LIMIT"),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  public constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");

    consumer.apply(CsrfMiddleware).exclude("/csrf").forRoutes("*");
  }
}
