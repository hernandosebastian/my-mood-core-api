import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { User } from '@iam/user/domain/user.entity';

import { CreateTrackDto } from '@/module/track/application/dto/create-track.dto';
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
    const currentUser = this.getCurrentUser(request);
    const requestBody: CreateTrackDto = request.body;

    return (
      this.authorizationService.isAllowed(currentUser, this.action, Track) &&
      currentUser.id === requestBody.ownerId
    );
  }

  private getCurrentUser(request: Request): User {
    return request[REQUEST_USER_KEY];
  }
}
