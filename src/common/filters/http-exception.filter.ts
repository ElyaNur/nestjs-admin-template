import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { message, error, statusCode } = exception.getResponse() as Record<
      string,
      any
    >;

    let responseMessage = message;
    if (
      Array.isArray(responseMessage) &&
      typeof responseMessage[0] === 'string'
    ) {
      responseMessage = responseMessage.map((msg) => {
        const key = msg.split(' ')[0];

        return {
          [key]: msg,
          property: key,
          value: request.body[key],
        };
      });
    }

    if (typeof responseMessage === 'string' && statusCode === 400) {
      const key = responseMessage.split(' ')[0];
      responseMessage = [
        {
          [key]: responseMessage,
          property: key,
          value: request.body[key],
        },
      ];
    }

    response.status(status).json({
      success: false,
      message: responseMessage,
    });
  }
}
