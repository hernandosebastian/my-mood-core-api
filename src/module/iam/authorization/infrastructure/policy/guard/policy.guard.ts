import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { POLICIES_KEY } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policyHandlerStorage: PolicyHandlerStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlersCls = this.getPolicyHandlersCls(context);

    if (handlersCls) {
      await Promise.all(
        handlersCls.map((handlerCls) => {
          const handler = this.policyHandlerStorage.get(handlerCls);
          return handler.handle(this.getContextRequest(context));
        }),
      ).catch((error) => {
        throw new ForbiddenException(error.message);
      });
    }

    return true;
  }

  private getPolicyHandlersCls(
    context: ExecutionContext,
  ): Type<IPolicyHandler>[] | undefined {
    return this.reflector.getAllAndOverride(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private getContextRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }
}
