import { MongoAbility, MongoQuery } from '@casl/ability';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { AppSubjects } from '@iam/authorization/infrastructure/casl/type/app-subjects.type';

type PossibleAbilities = [AppAction, AppSubjects];
type Conditions = MongoQuery;

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;
