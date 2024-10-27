import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Track } from '@/module/track/domain/track.entity';

type TrackFields = IGetAllOptions<Track>['fields'];

export class TracksFieldsQueryParamsDto {
  @ApiPropertyOptional()
  @IsIn(['title', 'description', 'date', 'ownerId'] as TrackFields, {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: TrackFields;
}
