import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { IUserRepository } from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';
import { NicknameTakenException } from '@iam/user/infrastructure/database/exception/nickname-taken.exception';
import { UserNotFoundException } from '@iam/user/infrastructure/database/exception/user-not-found.exception';
import { UserSchema } from '@iam/user/infrastructure/database/user.schema';

import { UsernameNotFoundException } from './exception/username-not-found.exception';

export class UserMysqlRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<User>,
  ) {}

  async getAll(options: IGetAllOptions<User>): Promise<ICollection<User>> {
    const { filter, page, sort, fields } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: { ...filter, roles: filter.roles && In(filter.roles) },
      order: sort,
      select: fields,
      take: page.size,
      skip: page.offset,
    });

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneByUsername(username: string): Promise<User> {
    return this.repository.findOne({
      where: { username },
    });
  }

  async getOneByExternalId(externalId: string): Promise<User> {
    return this.repository.findOne({
      where: { externalId },
    });
  }

  async getOneByIdOrFail(id: number): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UserNotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async getOneByUsernameOrFail(username: string) {
    const user = await this.repository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UsernameNotFoundException(username);
    }

    return user;
  }

  async getOneByNickname(nickname: string): Promise<User> {
    return this.repository.findOne({ where: { nickname } });
  }

  async saveOne(user: User): Promise<User> {
    const existingUserWithNickname = await this.getOneByNickname(user.nickname);

    if (existingUserWithNickname) {
      throw new NicknameTakenException(user.nickname);
    }

    return this.repository.save(user);
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<User, 'id'>>,
  ): Promise<User> {
    const userToUpdate = await this.repository.preload({
      id,
      ...updates,
    });

    if (!userToUpdate) {
      throw new UserNotFoundException(`User with ID ${id} not found`);
    }

    if (updates.nickname) {
      const existingUserWithNickname = await this.getOneByNickname(
        userToUpdate.nickname,
      );

      if (existingUserWithNickname) {
        throw new NicknameTakenException(userToUpdate.nickname);
      }
    }

    return this.repository.save(userToUpdate);
  }
}
