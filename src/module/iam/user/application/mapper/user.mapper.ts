import { Injectable } from '@nestjs/common';

import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class UserMapper {
  fromUserToUserResponseDto(user: User): UserResponseDto {
    const userResponseDto = new UserResponseDto();
    userResponseDto.id = user.id;
    userResponseDto.username = user.username;
    userResponseDto.externalId = user.externalId;
    userResponseDto.roles = user.roles;
    userResponseDto.createdAt = user.createdAt;
    userResponseDto.updatedAt = user.updatedAt;
    userResponseDto.deletedAt = user.deletedAt;
    return userResponseDto;
  }
}
