import { UnauthorizedException } from '@nestjs/common';

export class NewPasswordRequiredException extends UnauthorizedException {
  constructor(message: string) {
    super(message);
  }
}
