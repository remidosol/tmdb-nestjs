import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { Response } from "express";
import { MongoError } from "mongodb";

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter<MongoError> {
  private logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(exception.message, { error: exception });

    console.error(exception);
    console.error(JSON.stringify(exception, null, 2));

    response.status(500).json({
      statusCode: 500,
      message: "Something went wrong!",
    });
  }
}
