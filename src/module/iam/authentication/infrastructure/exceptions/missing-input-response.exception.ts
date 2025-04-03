import { BadRequestException } from '@nestjs/common';

import { MISSING_INPUT_RESPONSE } from '@iam/authentication/infrastructure/google-recaptcha/google-recaptcha.exception.messages';

export class MissingInputResponseException extends BadRequestException {
  constructor() {
    super(MISSING_INPUT_RESPONSE);
  }
}
