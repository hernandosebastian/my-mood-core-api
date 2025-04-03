import { HttpService } from '@nestjs/axios';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '@config/environment.enum';

import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';
import { BadRequestResponseException } from '@iam/authentication/infrastructure/exceptions/bar-request-response.exception';
import { InvalidInputResponseException } from '@iam/authentication/infrastructure/exceptions/invalid-input-response.exception';
import { InvalidInputSecretException } from '@iam/authentication/infrastructure/exceptions/invalid-input-secret.exception';
import { MissingInputResponseException } from '@iam/authentication/infrastructure/exceptions/missing-input-response.exception';
import { MissingInputSecretException } from '@iam/authentication/infrastructure/exceptions/missing-input-secret.exception';
import { TimeoutOrDuplicateException } from '@iam/authentication/infrastructure/exceptions/timeout-or-duplicate.exception';

type RecaptchaErrorCode =
  | 'missing-input-secret'
  | 'invalid-input-secret'
  | 'missing-input-response'
  | 'invalid-input-response'
  | 'bad-request'
  | 'timeout-or-duplicate';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: RecaptchaErrorCode[];
}

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly recaptchaSecret: string;
  private readonly recaptchaVerifyUrl: string;
  private readonly isTestingEnvironment: boolean;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.recaptchaSecret = this.configService.get<string>(
      'recaptcha.secretKey',
    );
    this.recaptchaVerifyUrl =
      this.configService.get<string>('recaptcha.verifyUrl') ??
      'https://www.google.com/recaptcha/api/siteverify';
    this.isTestingEnvironment =
      this.configService.get<string>('NODE_ENV') ===
      ENVIRONMENT.AUTOMATED_TESTS;

    if (!this.recaptchaSecret && !this.isTestingEnvironment) {
      throw new MissingInputSecretException();
    }
  }

  private handleRecaptchaError(errorCode: RecaptchaErrorCode): never {
    switch (errorCode) {
      case 'missing-input-secret':
        throw new MissingInputSecretException();
      case 'invalid-input-secret':
        throw new InvalidInputSecretException();
      case 'missing-input-response':
        throw new MissingInputResponseException();
      case 'invalid-input-response':
        throw new InvalidInputResponseException();
      case 'timeout-or-duplicate':
        throw new TimeoutOrDuplicateException();
      case 'bad-request':
        throw new BadRequestResponseException();
      default:
        throw new BadRequestException(
          'Error desconocido en la validación de reCAPTCHA',
        );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { recaptchaToken } = request.body as ISignUpDto;
    const userIp = request.ip;

    if (!recaptchaToken) {
      throw new MissingInputResponseException();
    }

    if (this.isTestingEnvironment) {
      return true;
    }

    const params = new URLSearchParams();
    params.append('secret', this.recaptchaSecret);
    params.append('response', recaptchaToken);
    params.append('remoteip', userIp);

    try {
      const response = await firstValueFrom(
        this.httpService.post<RecaptchaResponse>(
          this.recaptchaVerifyUrl,
          params,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );
      const data = response.data;

      if (!data.success) {
        const errorCode = data['error-codes']?.[0];
        if (errorCode) {
          this.handleRecaptchaError(errorCode);
        }
        throw new BadRequestResponseException();
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestResponseException();
    }
  }
}
