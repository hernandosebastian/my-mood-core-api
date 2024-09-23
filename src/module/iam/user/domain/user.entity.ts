import { Base } from '@common/base/domain/base.entity';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

export class User extends Base {
  username: string;
  externalId?: string;
  roles: AppRole[];
  isVerified: boolean;

  constructor(
    username: string,
    roles: AppRole[],
    options?: {
      externalId?: string;
      id?: number;
      createdAt?: string;
      updatedAt?: string;
      deletedAt?: string;
      isVerified?: boolean;
    },
  ) {
    super(
      options?.id,
      options?.createdAt,
      options?.updatedAt,
      options?.deletedAt,
    );
    this.username = username;
    this.externalId = options?.externalId;
    this.roles = roles;
    this.isVerified = options?.isVerified;
  }
}
