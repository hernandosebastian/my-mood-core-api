import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(35)
  nickname?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarSrc?: string;
}
