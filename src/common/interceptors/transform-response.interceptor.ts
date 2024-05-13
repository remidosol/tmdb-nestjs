import { CallHandler, ClassSerializerInterceptor, ExecutionContext, PlainLiteralObject, Type } from "@nestjs/common";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MongooseClassSerializerInterceptor } from "../mongo/mongoose.serializer";

export interface SerializedResponse {
  statusCode: number;
  data: (PlainLiteralObject | object) | (PlainLiteralObject | object)[];
  pagination?: {
    total: number;
  };
}

export function TransformResponseInterceptor(classToSerialize: Type): typeof ClassSerializerInterceptor {
  const MongooseSerializer = MongooseClassSerializerInterceptor(classToSerialize);

  return class TransformInterceptor extends MongooseSerializer {
    intercept(context: ExecutionContext, next: CallHandler): Observable<SerializedResponse | object> {
      const response = context.switchToHttp().getResponse<Response<typeof classToSerialize>>();

      if (response.statusCode >= 200 && response.statusCode <= 299) {
        return next.handle().pipe(
          map((data) => {
            // console.log(data)
            if (data === null || data === undefined) {
              return {
                statusCode: response.statusCode,
                data: null,
              };
            } else if (typeof data === "string") {
              return {
                statusCode: response.statusCode,
                message: data,
              };
            } else if (
              ((Array.isArray(data) && data.length === 0) || (Array.isArray(data.data) && data.data.length === 0)) &&
              data.total !== undefined
            ) {
              return {
                statusCode: response.statusCode,
                data: [],
                pagination: {
                  total: data.total,
                },
              };
            } else if (
              (Array.isArray(data) && data.length === 0) ||
              (Array.isArray(data.data) && data.data.length === 0)
            ) {
              return {
                statusCode: response.statusCode,
                data: [],
              };
            } else if (Array.isArray(data.data) && data.total !== undefined) {
              const serializedData = this.serialize(data.data, this.defaultOptions);

              const responseBody: SerializedResponse = {
                statusCode: response.statusCode,
                data: serializedData,
                pagination: {
                  total: data.total,
                },
              };

              return responseBody;
            }

            // console.log("data", data);
            const serializedData = this.serialize(data, this.defaultOptions);

            const responseBody: SerializedResponse = {
              statusCode: response.statusCode,
              data: serializedData,
            };

            return responseBody;
          })
        );
      }

      return next.handle();
    }
  };
}
