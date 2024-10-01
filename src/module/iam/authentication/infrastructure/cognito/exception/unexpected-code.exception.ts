import { InternalServerErrorException } from '@nestjs/common';

import { UNEXPECTED_ERROR_CODE_ERROR } from '@iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';

export class UnexpectedErrorCodeException extends InternalServerErrorException {
  constructor(code: string) {
    super(`${UNEXPECTED_ERROR_CODE_ERROR} - ${code}`);
  }
}
