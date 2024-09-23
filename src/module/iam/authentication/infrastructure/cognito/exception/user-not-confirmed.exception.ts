import { ForbiddenException } from '@nestjs/common';

export class UserNotConfirmedException extends ForbiddenException {
  constructor(message: string) {
    super(message);
  }
}
