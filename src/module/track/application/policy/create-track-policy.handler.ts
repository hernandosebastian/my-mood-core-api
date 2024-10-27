import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

import { Track } from '@/module/track/domain/track.entity';

@Injectable()
export class CreateTrackPolicyHandler implements IPolicyHandler {
  private readonly action = AppAction.Create;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    this.policyHandlerStorage.add(CreateTrackPolicyHandler, this);
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
      Track,
    );

    return hasPermission;
  }
}
