import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async getAll(
    options: IGetAllOptions<User>,
  ): Promise<CollectionDto<UserResponseDto>> {
    const collection = await this.userRepository.getAll(options);
    return new CollectionDto({
      ...collection,
      data: collection.data.map((user) =>
        this.userMapper.fromUserToUserResponseDto(user),
      ),
    });
  }

  async getOneOrFail(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.getOneByIdOrFail(id);

    return this.userMapper.fromUserToUserResponseDto(user);
  }
}
