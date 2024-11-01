import { Inject, Injectable } from '@nestjs/common';

import { UserService } from '@iam/user/application/service/user.service';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';
import { GetTracksByDateRangeDto } from '@/module/track/application/dto/get-tracks-by-date-range.dto';
import { TrackResponseDto } from '@/module/track/application/dto/track-response.dto';
import { IUpdateTrackDto } from '@/module/track/application/dto/update-track.dto.interface';
import { TrackMapper } from '@/module/track/application/mapper/track.mapper';
import {
  ITrackRepository,
  TRACK_REPOSITORY_KEY,
} from '@/module/track/application/repository/track.repository.interface';

@Injectable()
export class TrackService {
  constructor(
    @Inject(TRACK_REPOSITORY_KEY)
    private readonly trackRepository: ITrackRepository,
    private readonly userService: UserService,
    private readonly trackMapper: TrackMapper,
  ) {}

  async getTracksByDateRange(
    getTracksByDateRangeDto: GetTracksByDateRangeDto,
    ownerId: number,
  ): Promise<TrackResponseDto[]> {
    await this.userService.getOneOrFail(ownerId);

    const startDate = new Date(getTracksByDateRangeDto.startDate);
    const endDate = new Date(getTracksByDateRangeDto.endDate);
    const tracks = await this.trackRepository.getTracksByDateRange(
      startDate,
      endDate,
      ownerId,
    );

    return tracks.map((track) =>
      this.trackMapper.fromTrackToTrackResponseDto(track),
    );
  }

  async saveOne(
    createTrackDto: ICreateTrackDto,
    ownerId: number,
  ): Promise<TrackResponseDto> {
    await this.userService.getOneOrFail(ownerId);

    const track = await this.trackRepository.saveOne(
      this.trackMapper.fromCreateTrackDtoToTrack(createTrackDto, ownerId),
    );

    return this.trackMapper.fromTrackToTrackResponseDto(track);
  }

  async updateOneOrFail(
    id: number,
    updateTrackDto: IUpdateTrackDto,
    ownerId: number,
  ): Promise<TrackResponseDto> {
    const track = await this.trackRepository.updateOneOrFail(
      id,
      this.trackMapper.fromUpdateTrackDtoToTrack(updateTrackDto, ownerId),
    );
    return this.trackMapper.fromTrackToTrackResponseDto(track);
  }

  async deleteOneOrFail(id: number): Promise<void> {
    return this.trackRepository.deleteOneOrFail(id);
  }
}
