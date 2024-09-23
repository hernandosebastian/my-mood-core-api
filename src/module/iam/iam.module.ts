import { Module } from '@nestjs/common';

import { AuthenticationModule } from '@iam/authentication/authentication.module';
import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { UserModule } from '@iam/user/user.module';

@Module({
  imports: [AuthenticationModule, AuthorizationModule.forRoot(), UserModule],
})
export class IamModule {}
