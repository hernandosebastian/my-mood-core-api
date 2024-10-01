import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { DefinePermissions } from '@iam/authorization/infrastructure/policy/type/define-permissions.type';

export type IPermissionsDefinition = Partial<
  Record<AppRole, DefinePermissions>
>;
