import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CorsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Always add CORS headers to error responses
    const origin = process.env.FRONTEND_URL || 'https://d3mdmjrv9mx88k.cloudfront.net';
    
    response.header('access-control-allow-origin', origin);
    response.header('access-control-allow-credentials', 'true');
    response.header('access-control-allow-methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    response.header('access-control-allow-headers', 'content-type,authorization,accept,x-requested-with');
    response.header('vary', 'Origin');

    response.status(status).json(message);
  }
}
