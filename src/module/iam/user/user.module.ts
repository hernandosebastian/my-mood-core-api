import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReadUserPolicyHandler } from '@iam/authentication/application/policy/read-user-policy.handler';
import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { USER_REPOSITORY_KEY } from '@iam/user/application/repository/user.repository.interface';
import { UserService } from '@iam/user/application/service/user.service';
import { userPermissions } from '@iam/user/domain/user.permission';
import { UserMysqlRepository } from '@iam/user/infrastructure/database/user.mysql.repository';
import { UserSchema } from '@iam/user/infrastructure/database/user.schema';
import { UserController } from '@iam/user/interface/user.controller';

const policyHandlersProviders = [ReadUserPolicyHandler];

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY_KEY,
  useClass: UserMysqlRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    AuthorizationModule.forFeature({ permissions: userPermissions }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    userRepositoryProvider,
    UserMapper,
    ...policyHandlersProviders,
  ],
  exports: [UserService, userRepositoryProvider, UserMapper],
})
export class UserModule {}
