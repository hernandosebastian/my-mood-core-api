import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ReadUserPolicyHandler } from '@iam/authentication/application/policy/read-user-policy.handler';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { User } from '@iam/user/domain/user.entity';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userMapper: UserMapper) {}
  @Get('me')
  @Policies(ReadUserPolicyHandler)
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.userMapper.fromUserToUserResponseDto(user);
  }
}
