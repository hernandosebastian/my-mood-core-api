import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { IConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto.interface';
import { IConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto.interface';
import { IForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto.interface';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';
import { IResendConfirmationCodeDto } from '@iam/authentication/application/dto/resend-confirmation-code.dto.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignInDto } from '@iam/authentication/application/dto/sign-in.dto.interface';
import { SignUpDto } from '@iam/authentication/application/dto/sign-up.dto';
import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';
import {
  TOKEN_EXPIRED_ERROR,
  USER_ALREADY_CONFIRMED_ERROR,
} from '@iam/authentication/application/exception/authentication-exception-messages';
import { TokenExpiredException } from '@iam/authentication/application/exception/token-expired.exception';
import { UserAlreadyConfirmed } from '@iam/authentication/application/exception/user-already-confirmed.exception';
import { CodeMismatchException } from '@iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  UNEXPECTED_ERROR_CODE_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { InvalidRefreshTokenException } from '@iam/authentication/infrastructure/cognito/exception/invalid-refresh-token.exception';
import { NewPasswordRequiredException } from '@iam/authentication/infrastructure/cognito/exception/new-password-required.exception';
import { PasswordValidationException } from '@iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';
import { UserNotConfirmedException } from '@iam/authentication/infrastructure/cognito/exception/user-not-confirmed.exception';
import { UsernameNotFoundException } from '@iam/user/infrastructure/database/exception/username-not-found.exception';

import {
  identityProviderServiceMock,
  testModuleBootstrapper,
} from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Authentication Module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Guards', () => {
    describe('Access Token', () => {
      it('should allow requests that contain a valid token', async () => {
        const accessToken = createAccessToken({
          sub: '00000000-0000-0000-0000-00000000000X',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user/me')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });

      it('should deny requests that contain an invalid token', async () => {
        const accessToken = createAccessToken({
          sub: 'non-existent-user-id',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user/me')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });
      it('should respond with an exception if the access token is expired', async () => {
        const expiration = '0ms';
        const accessToken = createAccessToken(
          {
            sub: '00000000-0000-0000-0000-00000000000X',
          },
          { expiresIn: expiration },
        );

        await request(app.getHttpServer())
          .get('/api/v1/user/me')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.message).toEqual(
              new TokenExpiredException(TOKEN_EXPIRED_ERROR).message,
            );
          });
      });
    });
  });

  describe('API', () => {
    describe('POST - /auth/sign-up', () => {
      it('should allow users to sign up', async () => {
        const externalId = '00000000-0000-0000-0000-000000000001';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        const signUpDto = {
          username: 'john.doe@test.com',
          password: '$Test123',
        } as SignUpDto;

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              username: signUpDto.username,
              externalId,
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('should allow users to retry their sign up if the external provider failed', async () => {
        identityProviderServiceMock.signUp.mockRejectedValueOnce(
          new CouldNotSignUpException('Could not sign up'),
        );

        const signUpDto = {
          username: 'jane.doe@test.com',
          password: '$Test123',
        } as SignUpDto;

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);

        const externalId = '00000000-0000-0000-0000-000000000002';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              username: signUpDto.username,
              externalId,
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('should throw an error if user already signed up', async () => {
        const externalId = '00000000-0000-0000-0000-000000000003';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        const signUpDto = {
          username: 'thomas.doe@test.com',
          password: '$Test123',
        } as SignUpDto;

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              username: signUpDto.username,
              externalId,
            });
            expect(body).toEqual(expectedResponse);
          });

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.message).toBe('User already signed up');
          });
      });

      it('Should throw an error if password is invalid', async () => {
        const error = new PasswordValidationException(
          PASSWORD_VALIDATION_ERROR,
        );
        identityProviderServiceMock.signUp.mockRejectedValueOnce(error);
        const signUpDto: ISignUpDto = {
          username: 'some@account.com',
          password: '123456',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
    describe('POST - /auth/sign-in', () => {
      it('Should allow users to sign in when provided a correct username and password', async () => {
        const serviceResponse: ISignInResponse = {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        };
        identityProviderServiceMock.signIn.mockResolvedValueOnce(
          serviceResponse,
        );

        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining(serviceResponse);
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should send an UserNotFound error when provided an invalid username', async () => {
        const signInDto: ISignInDto = {
          username: 'fakeUsername',
          password: 'fakePassword',
        };
        const error = new UsernameNotFoundException(signInDto.username);
        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });

      it('Should send an InvalidPassword error provided a valid user but invalid password', async () => {
        const error = new InvalidPasswordException(INVALID_PASSWORD_ERROR);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'fakePassword',
        };

        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });

      it('Should send an UnconfirmedUser error when user is not confirmed', async () => {
        const error = new UserNotConfirmedException(USER_NOT_CONFIRMED_ERROR);
        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.FORBIDDEN)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });

      it('Should send an UnexpectedErrorCode error when receiving uncovered error codes', async () => {
        const error = new UnexpectedErrorCodeException(
          UNEXPECTED_ERROR_CODE_ERROR,
        );
        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });

      it('Should send a NewPasswordRequired error when user needs to update their password', async () => {
        const error = new NewPasswordRequiredException(
          NEW_PASSWORD_REQUIRED_ERROR,
        );
        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
    describe('POST - /auth/confirm-user', () => {
      it('Should confirm a user when provided a correct confirmation code', async () => {
        const successResponse = {
          success: true,
          message: 'User successfully confirmed',
        };
        identityProviderServiceMock.confirmUser.mockResolvedValueOnce(
          successResponse,
        );
        const confirmUserDto: IConfirmUserDto = {
          username: 'admin@test.com',
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining(successResponse);
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should send a UserAlreadyConfirmed error when trying to confirm a confirmed user', async () => {
        const username = 'confirm@test.com';
        const error = new UserAlreadyConfirmed(USER_ALREADY_CONFIRMED_ERROR);
        const confirmUserDto: IConfirmUserDto = {
          username,
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.OK);

        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });

      it('Should send an UserNotFound error when provided an invalid username', async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException(username);
        const confirmUserDto: IConfirmUserDto = {
          username,
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });

      it('Should send a CodeMismatch error when provided an incorrect code', async () => {
        const error = new CodeMismatchException(CODE_MISMATCH_ERROR);
        identityProviderServiceMock.confirmUser.mockRejectedValueOnce(error);
        const confirmUserDto: IConfirmUserDto = {
          username: 'error@test.com',
          code: 'FakeCode',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should send an ExpiredCode error when provided an expired code', async () => {
        const error = new ExpiredCodeException(EXPIRED_CODE_ERROR);
        identityProviderServiceMock.confirmUser.mockRejectedValueOnce(error);
        const confirmUserDto: IConfirmUserDto = {
          username: 'error@test.com',
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnexpectedErrorCodeException(
          UNEXPECTED_ERROR_CODE_ERROR,
        );
        identityProviderServiceMock.confirmUser.mockRejectedValueOnce(error);
        const confirmUserDto: IConfirmUserDto = {
          username: 'error@test.com',
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
    describe('POST - /auth/forgot-password', () => {
      const url = '/api/v1/auth/forgot-password';
      it('Should respond with a success message when provided a username to forgot password', async () => {
        identityProviderServiceMock.forgotPassword.mockResolvedValueOnce({
          success: true,
          message: 'Password reset instructions have been sent',
        });
        const forgotPasswordDto: IForgotPasswordDto = {
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.success).toEqual(true);
          });
      });
      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException(username);
        const forgotPasswordDto: IForgotPasswordDto = { username };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnexpectedErrorCodeException(
          UNEXPECTED_ERROR_CODE_ERROR,
        );
        identityProviderServiceMock.forgotPassword.mockRejectedValueOnce(error);
        const forgotPasswordDto: IForgotPasswordDto = {
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
    describe('POST - /auth/confirm-password', () => {
      const url = '/api/v1/auth/confirm-password';
      it('Should respond with a success message when provided a username, password and code', async () => {
        identityProviderServiceMock.confirmPassword.mockResolvedValueOnce({
          success: true,
          message: 'Your password has been correctly updated',
        });
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '123456',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.success).toEqual(true);
          });
      });
      it('Should respond with a CodeMismatchError when the code is invalid', async () => {
        const error = new CodeMismatchException(CODE_MISMATCH_ERROR);
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an UsernameNotFound error when the user does not exist', async () => {
        const username = 'fake@fake.com';
        const error = new UsernameNotFoundException(username);
        const confirmPasswordDto: IConfirmPasswordDto = {
          username,
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with a PasswordValidationException when password is not strong enough', async () => {
        const error = new PasswordValidationException(
          PASSWORD_VALIDATION_ERROR,
        );
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnexpectedErrorCodeException(
          UNEXPECTED_ERROR_CODE_ERROR,
        );
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const forgotPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an ExpiredCodeException when the code has expired', async () => {
        const error = new ExpiredCodeException(EXPIRED_CODE_ERROR);
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
    describe('POST - /auth/resend-confirmation-code', () => {
      const url = '/api/v1/auth/resend-confirmation-code';
      it('Should resend the confirmation code when requested', async () => {
        const successResponse = {
          success: true,
          message: 'A new confirmation code has been sent',
        };
        identityProviderServiceMock.resendConfirmationCode.mockResolvedValueOnce(
          successResponse,
        );
        const confirmPasswordDto: IResendConfirmationCodeDto = {
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.success).toEqual(true);
          });
      });
      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException(username);
        const forgotPasswordDto: IForgotPasswordDto = { username };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        const error = new UnexpectedErrorCodeException(
          UNEXPECTED_ERROR_CODE_ERROR,
        );
        identityProviderServiceMock.resendConfirmationCode.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IResendConfirmationCodeDto = {
          username: 'admin@test.com',
        };
        return request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
    describe('POST - /auth/refresh', () => {
      const url = '/api/v1/auth/refresh';
      it('Should refresh the session when provided a valid refresh token', async () => {
        const successResponse: IRefreshSessionResponse = {
          accessToken: 'accessToken',
        };
        identityProviderServiceMock.refreshSession.mockResolvedValueOnce(
          successResponse,
        );
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'refreshToken',
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(successResponse);
          });
      });
      it('Should respond with an InvalidRefreshTokenError when provided an invalid refresh token', async () => {
        const error = new InvalidRefreshTokenException(
          INVALID_REFRESH_TOKEN_ERROR,
        );
        identityProviderServiceMock.refreshSession.mockRejectedValueOnce(error);
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'fakeRefreshToken',
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException(username);
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'fakeRefreshToken',
          username,
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        const error = new UnexpectedErrorCodeException(
          UNEXPECTED_ERROR_CODE_ERROR,
        );
        identityProviderServiceMock.refreshSession.mockRejectedValueOnce(error);
        const refreshSessionDto: IRefreshSessionDto = {
          username: 'admin@test.com',
          refreshToken: 'refreshToken',
        };
        return request(app.getHttpServer())
          .post(url)
          .send(refreshSessionDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.message).toEqual(error.message);
          });
      });
    });
  });
});
