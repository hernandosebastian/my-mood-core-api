import { Inject, Injectable } from '@nestjs/common';

import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { IConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto.interface';
import { IConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto.interface';
import { IForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto.interface';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';
import { IResendConfirmationCodeDto } from '@iam/authentication/application/dto/resend-confirmation-code.dto.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignInDto } from '@iam/authentication/application/dto/sign-in.dto.interface';
import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';
import { USER_ALREADY_CONFIRMED_ERROR } from '@iam/authentication/application/exception/authentication-exception-messages';
import { UserAlreadyConfirmed } from '@iam/authentication/application/exception/user-already-confirmed.exception';
import { UserAlreadySignedUp } from '@iam/authentication/application/exception/user-already-signed-up.exception';
import {
  IDENTITY_PROVIDER_SERVICE_KEY,
  IIdentityProviderService,
} from '@iam/authentication/application/service/identity-provider.service.interface';
import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(IDENTITY_PROVIDER_SERVICE_KEY)
    private readonly identityProviderService: IIdentityProviderService,
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async handleSignUp(signUpDto: ISignUpDto): Promise<UserResponseDto> {
    const { username, password } = signUpDto;

    const existingUser = await this.userRepository.getOneByUsername(username);

    if (!existingUser) {
      return this.signUpAndSave(username, password);
    }

    if (!existingUser.externalId) {
      return this.signUpAndSave(username, password, existingUser.id);
    }

    throw new UserAlreadySignedUp('User already signed up');
  }

  private async signUpAndSave(
    username: string,
    password: string,
    userId?: number,
  ): Promise<UserResponseDto> {
    let userToSaveId = userId;

    if (!userToSaveId) {
      userToSaveId = (
        await this.userRepository.saveOne(new User(username, [AppRole.Regular]))
      ).id;
    }

    const { externalId } = await this.identityProviderService.signUp(
      username,
      password,
    );

    const user = await this.userRepository.updateOneOrFail(userToSaveId, {
      externalId,
    });

    return this.userMapper.fromUserToUserResponseDto(user);
  }

  async handleSignIn(signInDto: ISignInDto): Promise<ISignInResponse> {
    const { username, password } = signInDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);
    return this.identityProviderService.signIn(existingUser.username, password);
  }

  async handleConfirmUser(
    confirmUserDto: IConfirmUserDto,
  ): Promise<ISuccessfulOperationResponse> {
    const { username, code } = confirmUserDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    if (existingUser.isVerified) {
      throw new UserAlreadyConfirmed(USER_ALREADY_CONFIRMED_ERROR);
    }

    const confirmUserResponse = await this.identityProviderService.confirmUser(
      existingUser.username,
      code,
    );

    await this.userRepository.updateOneOrFail(existingUser.id, {
      isVerified: true,
    });
    return confirmUserResponse;
  }

  async handleForgotPassword(
    forgotPasswordDto: IForgotPasswordDto,
  ): Promise<ISuccessfulOperationResponse> {
    const { username } = forgotPasswordDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);
    return this.identityProviderService.forgotPassword(existingUser.username);
  }

  async handleConfirmPassword(
    confirmPasswordDto: IConfirmPasswordDto,
  ): Promise<ISuccessfulOperationResponse> {
    const { username, newPassword, code } = confirmPasswordDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);
    return this.identityProviderService.confirmPassword(
      existingUser.username,
      newPassword,
      code,
    );
  }

  async handleResendConfirmationCode(
    resendConfirmationCodeDto: IResendConfirmationCodeDto,
  ): Promise<ISuccessfulOperationResponse> {
    const { username } = resendConfirmationCodeDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);
    return this.identityProviderService.resendConfirmationCode(
      existingUser.username,
    );
  }

  async handleRefreshSession(
    refreshSessionDto: IRefreshSessionDto,
  ): Promise<IRefreshSessionResponse> {
    const { username, refreshToken } = refreshSessionDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);
    return this.identityProviderService.refreshSession(
      existingUser.username,
      refreshToken,
    );
  }
}
