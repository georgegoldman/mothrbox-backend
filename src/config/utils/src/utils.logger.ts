/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ConsoleLogger,
} from '@nestjs/common';
import BaseError from './util.errors';

@Catch() // No specific exception type => This will catch all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new ConsoleLogger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Check if it's a HttpException or our custom BaseError
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof BaseError
          ? exception.code
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof BaseError
          ? exception.message
          : 'Internal server error';

    // For Fastify, use send() instead of json()
    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
