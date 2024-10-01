import { InternalServerErrorException } from '@nestjs/common';

export class CouldNotSignUpException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
