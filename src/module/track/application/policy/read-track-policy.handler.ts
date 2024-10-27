import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

import { Track } from '@/module/track/domain/track.entity';

@Injectable()
export class ReadTrackPolicyHandler implements IPolicyHandler {
  private readonly action = AppAction.Read;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    this.policyHandlerStorage.add(ReadTrackPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const currentUser = getCurrentUserFromRequest(request);

    const isAllowed = this.authorizationService.isAllowed(
      currentUser,
      this.action,
      Track,
    );

    if (!isAllowed) {
      throw new Error(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}
