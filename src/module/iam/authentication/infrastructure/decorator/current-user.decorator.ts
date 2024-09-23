import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';
import { User } from '@iam/user/domain/user.entity';

export const CurrentUser = createParamDecorator(
  (field: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: User | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
