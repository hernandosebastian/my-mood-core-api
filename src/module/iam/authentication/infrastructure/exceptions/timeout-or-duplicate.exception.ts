import { BadRequestException } from '@nestjs/common';

import { TIMEOUT_OR_DUPLICATE } from '@iam/authentication/infrastructure/google-recaptcha/google-recaptcha.exception.messages';

export class TimeoutOrDuplicateException extends BadRequestException {
  constructor() {
    super(TIMEOUT_OR_DUPLICATE);
  }
}
