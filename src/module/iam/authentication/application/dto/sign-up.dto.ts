import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';

export class SignUpDto implements ISignUpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty()
  @IsString()
  @MaxLength(35)
  @IsNotEmpty()
  nickname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}
