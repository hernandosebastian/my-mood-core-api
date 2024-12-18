import { BadRequestException } from '@nestjs/common';

export class PasswordValidationException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
