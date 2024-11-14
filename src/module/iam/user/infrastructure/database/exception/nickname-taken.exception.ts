import { ConflictException } from '@nestjs/common';

import { NICKNAME_TAKEN_ERROR } from '@iam/user/infrastructure/database/exception/user-exception-messages';

export class NicknameTakenException extends ConflictException {
  constructor(nickname: string) {
    super(`${nickname} ${NICKNAME_TAKEN_ERROR}`);
  }
}
