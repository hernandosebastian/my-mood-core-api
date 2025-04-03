import { BadRequestException } from '@nestjs/common';

import { BAD_REQUEST } from '@iam/authentication/infrastructure/google-recaptcha/google-recaptcha.exception.messages';

export class BadRequestResponseException extends BadRequestException {
  constructor() {
    super(BAD_REQUEST);
  }
}
