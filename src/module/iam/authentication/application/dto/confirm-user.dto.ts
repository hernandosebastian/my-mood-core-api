import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto.interface';

export class ConfirmUserDto implements IConfirmUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
