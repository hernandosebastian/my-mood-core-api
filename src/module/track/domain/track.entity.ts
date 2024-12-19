import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

import { Mood } from '@/module/track/application/enum/mood.enum';

export class Track extends Base {
  title: Mood;
  description?: string;
  date: Date;
  ownerId: number;
  owner: User;
}
