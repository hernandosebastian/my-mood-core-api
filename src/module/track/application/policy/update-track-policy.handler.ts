import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

import {
  ITrackRepository,
  TRACK_REPOSITORY_KEY,
} from '@/module/track/application/repository/track.repository.interface';
import { Track } from '@/module/track/domain/track.entity';
import { TrackNotFoundException } from '@/module/track/infrastructure/database/exception/track-not-found.exception';

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
    const currentUser = getCurrentUserFromRequest(request);
    const subject = await this.getSubjectOrThrowError(request);

    if (subject.ownerId !== currentUser.id) {
      throw new Error(`You do not own this resource`);
    }

    const isAllowed = this.authorizationService.isAllowed(
      currentUser,
      this.action,
      subject,
    );

    if (!isAllowed) {
      throw new Error(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }

  private async getSubjectOrThrowError(request: Request): Promise<Track> {
    const subjectId = parseInt(request.params.id);
    const subject = await this.trackRepository.getOneById(subjectId);

    if (!(subject instanceof Track)) {
      throw new TrackNotFoundException(
        `Track with ID ${request.params.id} not found`,
      );
    }

    return subject;
  }
}
