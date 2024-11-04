import { ConflictException } from '@nestjs/common';

export class TrackConflictException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
