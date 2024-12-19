import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { Mood } from '@/module/track/application/enum/mood.enum';

export class UpdateTrackDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(Mood)
  title?: Mood;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}
