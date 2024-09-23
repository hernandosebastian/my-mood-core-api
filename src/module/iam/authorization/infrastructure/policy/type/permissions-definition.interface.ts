import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { DefinePermissions } from '@iam/authorization/infrastructure/policy/type/define-permissions.type';

export interface IPermissionsDefinition
  extends Partial<Record<AppRole, DefinePermissions>> {}
