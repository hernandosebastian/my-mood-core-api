import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const customMessage =
      'Has realizado demasiadas solicitudes en poco tiempo. Por favor, espera un poco.';

    const responseBody = {
      statusCode: status,
      message: customMessage,
      error: 'Too Many Requests',
    };

    response.status(status).json(responseBody);
  }
}
