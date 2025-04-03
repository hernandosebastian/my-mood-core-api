import { BadRequestException } from '@nestjs/common';

import { INVALID_INPUT_RESPONSE } from '@iam/authentication/infrastructure/google-recaptcha/google-recaptcha.exception.messages';

export class InvalidInputResponseException extends BadRequestException {
  constructor() {
    super(INVALID_INPUT_RESPONSE);
  }
}
