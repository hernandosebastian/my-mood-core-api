import { BadRequestException } from '@nestjs/common';

import { MISSING_INPUT_SECRET } from '@iam/authentication/infrastructure/google-recaptcha/google-recaptcha.exception.messages';

export class MissingInputSecretException extends BadRequestException {
  constructor() {
    super(MISSING_INPUT_SECRET);
  }
}
