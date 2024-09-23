import { BadRequestException } from '@nestjs/common';

export class ExpiredCodeException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
