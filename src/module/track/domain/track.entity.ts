import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

export class Track extends Base {
  title: string;
  description?: string;
  date: Date;
  ownerId: number;
  owner: User;
}
