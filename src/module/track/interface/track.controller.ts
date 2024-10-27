import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';

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

  @Get('/by-date-range/:userId')
  @Policies(ReadTrackPolicyHandler)
  async getTracksByDateRange(
    @Body() getTracksByDateRangeDto: GetTracksByDateRangeDto,
    @Param('userId') userId: number,
  ): Promise<TrackResponseDto[]> {
    return this.trackService.getTracksByDateRange(
      getTracksByDateRangeDto,
      userId,
    );
  }

  @Post()
  @Policies(CreateTrackPolicyHandler)
  async saveOne(
    @Body() createTrackDto: CreateTrackDto,
  ): Promise<TrackResponseDto> {
    return this.trackService.saveOne(createTrackDto);
  }

  @Patch(':id')
  @Policies(UpdateTrackPolicyHandler)
  async updateOneOrFail(
    @Param('id') id: number,
    @Body() updateTrackDto: UpdateTrackDto,
  ): Promise<TrackResponseDto> {
    return this.trackService.updateOneOrFail(id, updateTrackDto);
  }

  @Policies(DeleteTrackPolicyHandler)
  @Delete(':id')
  async deleteOneOrFail(@Param('id') id: number): Promise<void> {
    return this.trackService.deleteOneOrFail(id);
  }
}
