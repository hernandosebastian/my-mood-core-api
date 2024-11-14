import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';

export class SignUpDto implements ISignUpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  avatarSrc: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
