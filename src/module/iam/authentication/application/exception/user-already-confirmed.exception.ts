import { BadRequestException } from '@nestjs/common';

export class UserAlreadyConfirmed extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
