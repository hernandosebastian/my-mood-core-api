import { UnauthorizedException } from '@nestjs/common';

export class CodeMismatchException extends UnauthorizedException {
  constructor(message: string) {
    super(message);
  }
}
