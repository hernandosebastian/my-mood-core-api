import { HttpService } from '@nestjs/axios';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '@config/environment.enum';

import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
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
      throw new BadRequestException('RECAPTCHA_SECRET_KEY no está configurada');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { recaptchaToken } = request.body as ISignUpDto;
    const userIp = request.ip;

    if (!recaptchaToken) {
      throw new BadRequestException('Falta el token de CAPTCHA.');
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
        const errorCodes = data['error-codes']?.join(', ');
        throw new BadRequestException(
          errorCodes
            ? `CAPTCHA inválido: ${errorCodes}`
            : 'CAPTCHA inválido. Intenta de nuevo.',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al verificar el CAPTCHA.', {
        cause: error,
      });
    }
  }
}
