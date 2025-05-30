import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';

import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';
import { User } from '@iam/user/domain/user.entity';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

import { CreateTrackDto } from '@/module/track/application/dto/create-track.dto';
import { IGetTrackStatsResponseDto } from '@/module/track/application/dto/get-track-stats-response.interface';
import { GetTracksByDateRangeDto } from '@/module/track/application/dto/get-tracks-by-date-range.dto';
import { TrackResponseDto } from '@/module/track/application/dto/track-response.dto';
import { UpdateTrackDto } from '@/module/track/application/dto/update-track.dto';
import { CreateTrackPolicyHandler } from '@/module/track/application/policy/create-track-policy.handler';
import { DeleteTrackPolicyHandler } from '@/module/track/application/policy/delete-track-policy.handler';
import { ReadTrackPolicyHandler } from '@/module/track/application/policy/read-track-policy.handler';
import { UpdateTrackPolicyHandler } from '@/module/track/application/policy/update-track-policy.handler';
import { TrackService } from '@/module/track/application/service/track.service';

@Controller('track')
@UseGuards(PoliciesGuard)
@ApiTags('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('/stats')
  @Policies(ReadTrackPolicyHandler)
  @SkipThrottle({ default: true })
  async getTrackStats(
    @Query() getTracksByDateRangeDto: GetTracksByDateRangeDto,
    @Request() req: ExpressRequest,
  ): Promise<IGetTrackStatsResponseDto> {
    const currentUser = this.getCurrentUser(req);
    return this.trackService.getTrackStats(
      getTracksByDateRangeDto,
      currentUser.id,
    );
  }

  @Get('/by-date-range')
  @SkipThrottle({ default: true })
  @Policies(ReadTrackPolicyHandler)
  async getTracksByDateRange(
    @Query() getTracksByDateRangeDto: GetTracksByDateRangeDto,
    @Request() req: ExpressRequest,
  ): Promise<TrackResponseDto[]> {
    const currentUser = this.getCurrentUser(req);

    return this.trackService.getTracksByDateRange(
      getTracksByDateRangeDto,
      currentUser.id,
    );
  }

  @Post()
  @Policies(CreateTrackPolicyHandler)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async saveOne(
    @Body() createTrackDto: CreateTrackDto,
    @Request() req: ExpressRequest,
  ): Promise<TrackResponseDto> {
    const currentUser = this.getCurrentUser(req);
    return this.trackService.saveOne(createTrackDto, currentUser.id);
  }

  @Patch(':id')
  @Policies(UpdateTrackPolicyHandler)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async updateOneOrFail(
    @Param('id') id: number,
    @Body() updateTrackDto: UpdateTrackDto,
    @Request() req: ExpressRequest,
  ): Promise<TrackResponseDto> {
    const currentUser = this.getCurrentUser(req);

    return this.trackService.updateOneOrFail(
      id,
      updateTrackDto,
      currentUser.id,
    );
  }

  @Delete(':id')
  @Policies(DeleteTrackPolicyHandler)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async deleteOneOrFail(@Param('id') id: number): Promise<void> {
    return this.trackService.deleteOneOrFail(id);
  }

  private getCurrentUser(request: ExpressRequest): User {
    return getCurrentUserFromRequest(request);
  }
}
