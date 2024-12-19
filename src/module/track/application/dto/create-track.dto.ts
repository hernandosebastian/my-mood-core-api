import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';
import { Mood } from '@/module/track/application/enum/mood.enum';

export class CreateTrackDto implements Partial<ICreateTrackDto> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Mood)
  title: Mood;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  date: Date;
}
