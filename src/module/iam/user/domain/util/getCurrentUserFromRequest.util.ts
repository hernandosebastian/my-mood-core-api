import { Request } from 'express';

import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';
import { User } from '@iam/user/domain/user.entity';

export const getCurrentUserFromRequest = (request: Request): User => {
  return request[REQUEST_USER_KEY];
};
