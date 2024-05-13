import { NestApplication, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication, NestExpressBodyParserOptions } from "@nestjs/platform-express";
import responseTime from "response-time";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ConfigService } from "./config/config.service";
import { Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import mongoose from "mongoose";
import { ValidationErrorsInterceptor } from "./common/interceptors";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
      credentials: true,
    },
    rawBody: true,
  });

  app.setGlobalPrefix("api");

  const configService = app.get(ConfigService);
  const logger = new Logger(NestApplication.name);

  app.use(responseTime({ digits: 3, header: "X-Response-Time", suffix: true }));

  app.useGlobalInterceptors(new ValidationErrorsInterceptor());
  app.use(helmet({ contentSecurityPolicy: configService.getOrThrow("NODE_ENV") === "production" ? undefined : false }));
  app.use(cookieParser());

  app.set("trust proxy", true);
  app.useBodyParser("json", { limit: "5mb" } as NestExpressBodyParserOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const mainConf = new DocumentBuilder()
    .setTitle("TMDB NestJS Case")
    .setDescription(
      "TMDB NestJS case is an interview case for NestJS. This API is built with NestJS, MongoDB, Swagger, and Docker."
    )
    .setVersion("1.0")
    .setExternalDoc("TMDB API", "https://developers.themoviedb.org/3")
    .setExternalDoc(
      "GraphQL Playground",
      `http://${configService.getOrThrow("HOST") + ":" + configService.getOrThrow("PORT")}/graphql`
    )
    .addCookieAuth(
      configService.getOrThrow("CSRF_COOKIE_NAME"),
      { type: "apiKey", in: "cookie", name: configService.getOrThrow("CSRF_COOKIE_NAME") },
      configService.getOrThrow("CSRF_COOKIE_NAME")
    )
    .addApiKey(
      {
        type: "apiKey",
        in: "header",
        description: "CSRF Header",
        name: configService.getOrThrow("CSRF_HEADER_NAME"),
      },
      configService.getOrThrow("CSRF_HEADER_NAME")
    )
    .build();

  const mainDocument = SwaggerModule.createDocument(app, { ...mainConf });

  SwaggerModule.setup("api", app, mainDocument);

  mongoose.set("debug", configService.getOrThrow("DEBUG") === "true");

  await app.listen(configService.getOrThrow("PORT"));

  logger.log(
    `Application is running on: http://${configService.getOrThrow("HOST") + ":" + configService.getOrThrow("PORT")}`
  );

  logger.log(
    `Swagger is running on: http://${
      configService.getOrThrow("HOST") + ":" + configService.getOrThrow("PORT") + "/api"
    }`
  );

  logger.log(
    `GraphQL Playground is running on: http://${
      configService.getOrThrow("HOST") + ":" + configService.getOrThrow("PORT") + "/graphql"
    }`
  );
}

bootstrap();
