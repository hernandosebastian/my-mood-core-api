import * as jwt from 'jsonwebtoken';

import { IAccessTokenPayload } from '@iam/authentication/infrastructure/passport/access-token-payload.interface';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

export const createAccessToken = (
  payload: Partial<IAccessTokenPayload>,
  options?: jwt.SignOptions,
) => {
  return jwt.sign(payload, JWT_AUTOMATED_TESTS_SECRET, options);
};
