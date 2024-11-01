import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Track } from '@/module/track/domain/track.entity';

export const trackPermissions: IPermissionsDefinition = {
  regular(user, { can }) {
    can(AppAction.Read, Track);
    can(AppAction.Create, Track);
    can(AppAction.Update, Track, { id: user.id });
    can(AppAction.Delete, Track, { id: user.id });
  },
};
