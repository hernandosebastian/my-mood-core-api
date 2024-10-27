import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

import { Track } from '@/module/track/domain/track.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  externalId?: string;

  @ApiProperty()
  roles: AppRole[];

  @ApiPropertyOptional()
  tracks?: Track[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;
}
