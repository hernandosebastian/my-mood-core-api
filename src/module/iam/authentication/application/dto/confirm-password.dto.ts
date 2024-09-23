import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto.interface';

export class ConfirmPasswordDto implements IConfirmPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
