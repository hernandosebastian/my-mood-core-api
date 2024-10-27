import { Inject, Injectable, Type } from '@nestjs/common';
import { Request } from 'express';

import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { User } from '@iam/user/domain/user.entity';

import {
  ITrackRepository,
  TRACK_REPOSITORY_KEY,
} from '@/module/track/application/repository/track.repository.interface';
import { Track } from '@/module/track/domain/track.entity';

@Injectable()
export class UpdateTrackPolicyHandler implements IPolicyHandler {
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
    @Inject(TRACK_REPOSITORY_KEY)
    private readonly trackRepository: ITrackRepository,
  ) {
    this.policyHandlerStorage.add(UpdateTrackPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const currentUser = this.getCurrentUser(request);
    const subjectOrSubjectCls = await this.getSubject(request);

    const isAllowed = this.authorizationService.isAllowed(
      currentUser,
      this.action,
      subjectOrSubjectCls,
    );

    if (!isAllowed) {
      throw new Error(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }

  private getCurrentUser(request: Request): User {
    return request[REQUEST_USER_KEY];
  }

  private async getSubject(request: Request): Promise<Track | Type<Track>> {
    const searchParam = request.params['id'];
    const subjectId = searchParam ? parseInt(searchParam) : undefined;
    const subject = await this.trackRepository.getOneById(subjectId);
    return subject ?? Track;
  }
}
