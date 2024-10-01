/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';

import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignUpResponse } from '@iam/authentication/application/dto/sign-up-response.interface';
import { IIdentityProviderService } from '@iam/authentication/application/service/identity-provider.service.interface';
import { ICognitoRefreshSessionResponse } from '@iam/authentication/infrastructure/cognito/cognito-refresh-session-response.interface';
import { CodeMismatchException } from '@iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { ICognitoRequestError } from '@iam/authentication/infrastructure/cognito/exception/cognito-request-error.interface';
import { CouldNotSignUpException } from '@iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { InvalidRefreshTokenException } from '@iam/authentication/infrastructure/cognito/exception/invalid-refresh-token.exception';
import { NewPasswordRequiredException } from '@iam/authentication/infrastructure/cognito/exception/new-password-required.exception';
import { PasswordValidationException } from '@iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';
import { UserNotConfirmedException } from '@iam/authentication/infrastructure/cognito/exception/user-not-confirmed.exception';

@Injectable()
export class CognitoService implements IIdentityProviderService {
  private readonly userPool: CognitoUserPool;

  constructor(private readonly configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.configService.get('cognito.userPoolId'),
      ClientId: this.configService.get('cognito.clientId'),
      endpoint: this.configService.get('cognito.endpoint'),
    });
  }

  async signUp(username: string, password: string): Promise<ISignUpResponse> {
    const requiredUserAttributes = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: username,
      }),
    ];

    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        username,
        password,
        requiredUserAttributes,
        null,
        (error: ICognitoRequestError | null, result) => {
          if (!error) {
            return resolve({ externalId: result.userSub });
          } else if (error.code === 'InvalidPasswordException') {
            return reject(
              new PasswordValidationException(PASSWORD_VALIDATION_ERROR),
            );
          } else {
            return reject(new CouldNotSignUpException(error.message));
          }
        },
      );
    });
  }

  async signIn(username: string, password: string): Promise<ISignInResponse> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });

    cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          return resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err: ICognitoRequestError) => {
          if (err.code === 'UserNotConfirmedException') {
            return reject(
              new UserNotConfirmedException(USER_NOT_CONFIRMED_ERROR),
            );
          } else if (err.code === 'InvalidPasswordException') {
            return reject(new InvalidPasswordException(INVALID_PASSWORD_ERROR));
          } else if (err.code === 'NotAuthorizedException') {
            return reject(
              new PasswordValidationException(INVALID_PASSWORD_ERROR),
            );
          } else if (err.code === 'PasswordResetRequiredException') {
            return reject(
              new NewPasswordRequiredException(NEW_PASSWORD_REQUIRED_ERROR),
            );
          } else {
            return reject(new UnexpectedErrorCodeException(err.code));
          }
        },
        newPasswordRequired: () => {
          return reject(
            new NewPasswordRequiredException(NEW_PASSWORD_REQUIRED_ERROR),
          );
        },
      });
    });
  }

  async confirmUser(
    username: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse> {
    const userData = {
      Username: username,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(
        code,
        true,
        (error: ICognitoRequestError | null) => {
          if (!error) {
            return resolve({
              success: true,
              message: 'User successfully confirmed',
            });
          } else if (error?.code === 'CodeMismatchException') {
            return reject(new CodeMismatchException(CODE_MISMATCH_ERROR));
          } else if (error?.code === 'ExpiredCodeException') {
            return reject(new ExpiredCodeException(EXPIRED_CODE_ERROR));
          } else {
            return reject(new UnexpectedErrorCodeException(error.code));
          }
        },
      );
    });
  }

  async resendConfirmationCode(
    username: string,
  ): Promise<ISuccessfulOperationResponse> {
    const userData = {
      Username: username,
      Pool: this.userPool,
    };

    const userCognito = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      userCognito.resendConfirmationCode((err: ICognitoRequestError | null) => {
        if (err) {
          return reject(new UnexpectedErrorCodeException(err.code));
        }

        return resolve({
          success: true,
          message: 'A new confirmation code has been sent',
        });
      });
    });
  }

  async forgotPassword(
    username: string,
  ): Promise<ISuccessfulOperationResponse> {
    const userData = {
      Username: username,
      Pool: this.userPool,
    };

    const userCognito = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      userCognito.forgotPassword({
        onSuccess: () => {
          return resolve({
            success: true,
            message: 'Password reset instructions have been sent',
          });
        },
        onFailure: (err: ICognitoRequestError) => {
          return reject(new UnexpectedErrorCodeException(err.code));
        },
      });
    });
  }

  async confirmPassword(
    username: string,
    newPassword: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse> {
    const userData = {
      Username: username,
      Pool: this.userPool,
    };
    const userCognito = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      userCognito.confirmPassword(code, newPassword, {
        onSuccess: () => {
          return resolve({
            success: true,
            message: 'Your password has been correctly updated',
          });
        },
        onFailure: (error: ICognitoRequestError) => {
          if (error.code === 'CodeMismatchException') {
            return reject(new CodeMismatchException(CODE_MISMATCH_ERROR));
          } else if (error.code === 'ExpiredCodeException') {
            return reject(new ExpiredCodeException(EXPIRED_CODE_ERROR));
          } else if (error.code === 'InvalidPasswordException') {
            return reject(
              new PasswordValidationException(PASSWORD_VALIDATION_ERROR),
            );
          } else {
            return reject(new UnexpectedErrorCodeException(error.code));
          }
        },
      });
    });
  }

  async refreshSession(
    username: string,
    refreshToken: string,
  ): Promise<IRefreshSessionResponse> {
    const userData = {
      Username: username,
      Pool: this.userPool,
    };
    const userCognito: CognitoUser = new CognitoUser(userData);
    const token = new CognitoRefreshToken({ RefreshToken: refreshToken });
    return new Promise((resolve, reject) => {
      userCognito.refreshSession(
        token,
        (
          err: ICognitoRequestError | null,
          res: ICognitoRefreshSessionResponse,
        ) => {
          if (!err) {
            return resolve({ accessToken: res.idToken.jwtToken });
          } else if (err.code === 'NotAuthorizedException') {
            return reject(
              new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN_ERROR),
            );
          } else {
            return reject(new UnexpectedErrorCodeException(err.code));
          }
        },
      );
    });
  }
}
