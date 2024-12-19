import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { Mood } from '@/module/track/application/enum/mood.enum';

export class TrackResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsEnum(Mood)
  title: Mood;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  ownerId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;
}
