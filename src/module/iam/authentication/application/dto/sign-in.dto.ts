import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ISignInDto } from '@iam/authentication/application/dto/sign-in.dto.interface';

export class SignInDto implements ISignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
