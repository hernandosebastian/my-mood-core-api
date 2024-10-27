import { InferSubjects } from '@casl/ability';

import { User } from '@iam/user/domain/user.entity';

import { Track } from '@/module/track/domain/track.entity';

export type AppSubjects = InferSubjects<typeof User | typeof Track> | 'all';
