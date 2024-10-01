import { InferSubjects } from '@casl/ability';

import { User } from '@iam/user/domain/user.entity';

export type AppSubjects = InferSubjects<typeof User> | 'all';
