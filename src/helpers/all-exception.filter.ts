import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiErrorResponse } from 'src/dtos/api-response-wrapper.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      message =
        exceptionResponse && typeof exceptionResponse !== 'string'
          ? exceptionResponse.message
            ? typeof exceptionResponse?.message !== 'string'
              ? exceptionResponse?.message?.join('. ')
              : exceptionResponse?.message
            : exceptionResponse
              ? exceptionResponse
              : message || 'Internal Server Error'
          : message || 'Internal Server Error';
    } else {
      console.log(exception);
    }

    const responseBody: ApiErrorResponse = {
      statusCode: httpStatus,
      message: message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      requestId: req.headers['requestId'],
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
