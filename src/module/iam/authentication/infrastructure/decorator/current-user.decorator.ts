import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { User } from '@iam/user/domain/user.entity';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

export const CurrentUser = createParamDecorator(
  (field: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: User | undefined = getCurrentUserFromRequest(request);
    return field ? user?.[field] : user;
  },
);
