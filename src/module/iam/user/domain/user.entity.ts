import { Base } from '@common/base/domain/base.entity';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

import { Track } from '@/module/track/domain/track.entity';

export class User extends Base {
  username: string;
  nickname: string;
  avatarSrc: string;
  externalId?: string;
  roles: AppRole[];
  isVerified: boolean;
  tracks?: Track[];

  constructor(
    username: string,
    nickname: string,
    avatarSrc: string,
    roles: AppRole[],
    tracks?: Track[],
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
    this.nickname = nickname;
    this.avatarSrc = avatarSrc;
    this.externalId = options?.externalId;
    this.roles = roles;
    this.isVerified = options?.isVerified;
    this.tracks = tracks;
  }
}
