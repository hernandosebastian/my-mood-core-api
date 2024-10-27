import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';

export class CreateTrackDto implements Partial<ICreateTrackDto> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  date: Date;
}
