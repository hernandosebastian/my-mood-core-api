import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';

export class CreateTrackDto implements Partial<ICreateTrackDto> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

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
