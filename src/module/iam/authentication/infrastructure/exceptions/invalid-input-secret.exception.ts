import { BadRequestException } from '@nestjs/common';

import { INVALID_INPUT_SECRET } from '@iam/authentication/infrastructure/google-recaptcha/google-recaptcha.exception.messages';

export class InvalidInputSecretException extends BadRequestException {
  constructor() {
    super(INVALID_INPUT_SECRET);
  }
}
