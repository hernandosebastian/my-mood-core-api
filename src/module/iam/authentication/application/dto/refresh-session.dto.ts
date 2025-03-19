import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';

export class RefreshSessionDto implements IRefreshSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
