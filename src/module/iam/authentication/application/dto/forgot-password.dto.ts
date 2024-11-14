import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto.interface';

export class ForgotPasswordDto implements IForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;
}
