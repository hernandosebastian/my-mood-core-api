import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';
import { User } from '@iam/user/domain/user.entity';
import { getCurrentUserFromRequest } from '@iam/user/domain/util/getCurrentUserFromRequest.util';

import { CreateTrackDto } from '@/module/track/application/dto/create-track.dto';
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

  @Get('/by-date-range')
  @Policies(ReadTrackPolicyHandler)
  async getTracksByDateRange(
    @Body() getTracksByDateRangeDto: GetTracksByDateRangeDto,
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
  async saveOne(
    @Body() createTrackDto: CreateTrackDto,
    @Request() req: ExpressRequest,
  ): Promise<TrackResponseDto> {
    const currentUser = this.getCurrentUser(req);
    return this.trackService.saveOne(createTrackDto, currentUser.id);
  }

  @Patch(':id')
  @Policies(UpdateTrackPolicyHandler)
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

  @Policies(DeleteTrackPolicyHandler)
  @Delete(':id')
  async deleteOneOrFail(@Param('id') id: number): Promise<void> {
    return this.trackService.deleteOneOrFail(id);
  }

  private getCurrentUser(request: ExpressRequest): User {
    return getCurrentUserFromRequest(request);
  }
}
