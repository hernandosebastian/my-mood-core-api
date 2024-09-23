import { NotFoundException } from '@nestjs/common';

import { USERNAME_NOT_FOUND_ERROR } from '@iam/user/infrastructure/database/exception/user-exception-messages';

export class UsernameNotFoundException extends NotFoundException {
  constructor(username: string) {
    super(`${username} ${USERNAME_NOT_FOUND_ERROR}`);
  }
}
