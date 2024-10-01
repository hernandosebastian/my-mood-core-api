import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;
}
