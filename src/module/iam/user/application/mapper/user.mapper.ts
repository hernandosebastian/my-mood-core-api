import { Injectable } from '@nestjs/common';

import { IUpdateUserDto } from '@iam/user/application/dto/update-user.dto.interface';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class UserMapper {
  fromUserToUserResponseDto(user: User): UserResponseDto {
    const userResponseDto = new UserResponseDto();
    userResponseDto.id = user.id;
    userResponseDto.username = user.username;
    userResponseDto.nickname = user.nickname;
    userResponseDto.avatarSrc = user.avatarSrc;
    userResponseDto.externalId = user.externalId;
    userResponseDto.roles = user.roles;
    userResponseDto.createdAt = user.createdAt;
    userResponseDto.updatedAt = user.updatedAt;
    userResponseDto.deletedAt = user.deletedAt;
    return userResponseDto;
  }

  fromUpdateUserDtoToPartialUser(
    updateUserDto: IUpdateUserDto,
  ): Partial<Omit<User, 'id'>> {
    const updates: Partial<Omit<User, 'id'>> = {};
    if (updateUserDto.nickname) {
      updates.nickname = updateUserDto.nickname;
    }

    return updates;
  }
}
