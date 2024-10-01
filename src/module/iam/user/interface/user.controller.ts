import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';

import { ReadUserPolicyHandler } from '@iam/authentication/application/policy/read-user-policy.handler';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { UserFieldsQueryParamsDto } from '@iam/user/application/dto/user-fields-query-params.dto';
import { UserFilterQueryParamsDto } from '@iam/user/application/dto/user-filter-query-params.dto';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserSortQueryParamsDto } from '@iam/user/application/dto/user-sort-query-params.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { UserService } from '@iam/user/application/service/user.service';
import { User } from '@iam/user/domain/user.entity';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get()
  @Policies(ReadUserPolicyHandler)
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: UserFilterQueryParamsDto,
    @Query('sort') sort: UserSortQueryParamsDto,
    @Query('fields') fields: UserFieldsQueryParamsDto,
  ): Promise<CollectionDto<UserResponseDto>> {
    return this.userService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
    });
  }

  @Get('me')
  @Policies(ReadUserPolicyHandler)
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.userMapper.fromUserToUserResponseDto(user);
  }
}
