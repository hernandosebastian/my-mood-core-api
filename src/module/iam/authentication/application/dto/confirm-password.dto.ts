import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto.interface';

export class ConfirmPasswordDto implements IConfirmPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
