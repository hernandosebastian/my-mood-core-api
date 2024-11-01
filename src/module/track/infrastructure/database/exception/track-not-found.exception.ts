import { NotFoundException } from '@nestjs/common';

export class TrackNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}
