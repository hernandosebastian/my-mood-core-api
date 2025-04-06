import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { ConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto';
import { ConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto';
import { ForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { RefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto';
import { ResendConfirmationCodeDto } from '@iam/authentication/application/dto/resend-confirmation-code.dto';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { SignInDto } from '@iam/authentication/application/dto/sign-in.dto';
import { SignUpDto } from '@iam/authentication/application/dto/sign-up.dto';
import { AuthenticationService } from '@iam/authentication/application/service/authentication.service';
import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';
import { RecaptchaGuard } from '@iam/authentication/infrastructure/guard/recaptcha.guard';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';

@Controller('auth')
@ApiTags('auth')
@Auth(AuthType.None)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  async handleSignUp(@Body() signUpDto: SignUpDto): Promise<UserResponseDto> {
    return this.authenticationService.handleSignUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async handleSignIn(@Body() signInDto: SignInDto): Promise<ISignInResponse> {
    return this.authenticationService.handleSignIn(signInDto);
  }

  @Post('confirm-user')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async handleConfirmUser(
    @Body() confirmUserDto: ConfirmUserDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleConfirmUser(confirmUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  async handleForgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleForgotPassword(forgotPasswordDto);
  }

  @Post('confirm-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async handleConfirmPassword(
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleConfirmPassword(confirmPasswordDto);
  }

  @Post('resend-confirmation-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  async handleResendConfirmationCode(
    @Body() resendConfirmationCode: ResendConfirmationCodeDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleResendConfirmationCode(
      resendConfirmationCode,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async handleRefreshSession(
    @Body() refreshSessionDto: RefreshSessionDto,
  ): Promise<IRefreshSessionResponse> {
    return this.authenticationService.handleRefreshSession(refreshSessionDto);
  }
}
