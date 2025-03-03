import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { FileService } from '@common/file/application/service/file.service';

import { IUpdateUserDto } from '@iam/user/application/dto/update-user.dto.interface';
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
    private readonly fileService: FileService,
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

  async updateOneOrFail(
    id: number,
    updateUserDto: IUpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.updateOneOrFail(
      id,
      this.userMapper.fromUpdateUserDtoToPartialUser(updateUserDto),
    );

    return this.userMapper.fromUserToUserResponseDto(user);
  }

  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const folder = `assets/users/${userId}/avatar/`;
    const user = await this.userRepository.getOneByIdOrFail(userId);

    if (user.avatarSrc) {
      await this.fileService.deleteFile(user.avatarSrc);
    }
    const newAvatarSrc = await this.fileService.saveFile(file, folder);

    const avatarUpdate: Partial<Omit<User, 'id'>> = {
      avatarSrc: newAvatarSrc,
    };

    const updatedUser = await this.userRepository.updateOneOrFail(
      user.id,
      avatarUpdate,
    );
    return this.userMapper.fromUserToUserResponseDto(updatedUser);
  }
}
