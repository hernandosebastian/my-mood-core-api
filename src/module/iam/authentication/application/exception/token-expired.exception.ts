import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class TokenExpiredException extends HttpException {
  constructor(
    objectOrError?: string | object,
    descriptionOrOptions: string | HttpExceptionOptions = 'TokenExpired',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
    super(
      HttpException.createBody(
        typeof objectOrError === 'string'
          ? objectOrError
          : JSON.stringify(objectOrError),
        description,
        HttpStatus.UNAUTHORIZED,
      ),
      HttpStatus.UNAUTHORIZED,
      httpExceptionOptions,
    );
  }
}
