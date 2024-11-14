import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { User } from '@iam/user/domain/user.entity';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

@Injectable()
export class UpdateUserPolicyHandler implements IPolicyHandler {
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    this.policyHandlerStorage.add(UpdateUserPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    if (!this.hasPermission(request)) {
      throw new Error(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }

  private hasPermission(request: Request): boolean {
    const currentUser = getCurrentUserFromRequest(request);

    const hasPermission = this.authorizationService.isAllowed(
      currentUser,
      this.action,
      User,
    );

    return hasPermission;
  }
}
