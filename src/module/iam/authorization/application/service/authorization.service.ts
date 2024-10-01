import { Injectable } from '@nestjs/common';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { CaslAbilityFactory } from '@iam/authorization/infrastructure/casl/factory/casl-ability.factory';
import { AppSubjects } from '@iam/authorization/infrastructure/casl/type/app-subjects.type';

import { User } from '@/module/iam/user/domain/user.entity';

@Injectable()
export class AuthorizationService {
  constructor(private readonly abilityFactory: CaslAbilityFactory) {}

  isAllowed(user: User, action: AppAction, subject: AppSubjects): boolean {
    if (!user) {
      return false;
    }

    if (!action || !subject) {
      return false;
    }

    const userAbility = this.abilityFactory.createForUser(user);
    return userAbility.can(action, subject);
  }
}
