import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { User } from '@iam/user/domain/user.entity';

type UserFields = IGetAllOptions<User>['fields'];

export class UserFieldsQueryParamsDto {
  @ApiPropertyOptional()
  @IsIn(['username', 'externalId', 'roles'] as UserFields, { each: true })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: UserFields;
}
