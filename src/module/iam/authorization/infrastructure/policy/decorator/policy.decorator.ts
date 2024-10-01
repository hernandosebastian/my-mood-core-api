import { SetMetadata, Type } from '@nestjs/common';

import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';

export const POLICIES_KEY = 'policies';

export const Policies = (...handlers: Type<IPolicyHandler>[]) =>
  SetMetadata(POLICIES_KEY, handlers);
