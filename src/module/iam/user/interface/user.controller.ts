import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';

import { ReadUserPolicyHandler } from '@iam/authentication/application/policy/read-user-policy.handler';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { UpdateUserDto } from '@iam/user/application/dto/update-user.dto';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { UpdateUserPolicyHandler } from '@iam/user/application/policy/update-user-policy.handler';
import { UserService } from '@iam/user/application/service/user.service';
import { User } from '@iam/user/domain/user.entity';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';
import { AvatarFileInterceptor } from '@iam/user/infrastructure/interceptor/avatar-file.interceptor';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}
  @Get('me')
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @Policies(ReadUserPolicyHandler)
  async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.userMapper.fromUserToUserResponseDto(user);
  }

  @Patch('me')
  @Policies(UpdateUserPolicyHandler)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async updateOneOrFail(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<UserResponseDto> {
    const currentUser = this.getCurrentUser(req);

    return this.userService.updateOneOrFail(currentUser.id, updateUserDto);
  }

  @Post('avatar')
  @Policies(UpdateUserPolicyHandler)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseInterceptors(AvatarFileInterceptor())
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest,
  ): Promise<UserResponseDto> {
    const currentUser = this.getCurrentUser(req);

    return this.userService.uploadAvatar(currentUser.id, file);
  }

  private getCurrentUser(request: ExpressRequest): User {
    return getCurrentUserFromRequest(request);
  }
}
