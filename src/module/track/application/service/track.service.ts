import { Inject, Injectable } from '@nestjs/common';

import { UserService } from '@iam/user/application/service/user.service';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';
import { IGetTrackStatsResponseDto } from '@/module/track/application/dto/get-track-stats-response.interface';
import { GetTracksByDateRangeDto } from '@/module/track/application/dto/get-tracks-by-date-range.dto';
import { ITrackMonthlyStats } from '@/module/track/application/dto/track-monthly-stats.response.interface';
import { TrackResponseDto } from '@/module/track/application/dto/track-response.dto';
import { IUpdateTrackDto } from '@/module/track/application/dto/update-track.dto.interface';
import { TrackMapper } from '@/module/track/application/mapper/track.mapper';
import {
  ITrackRepository,
  TRACK_REPOSITORY_KEY,
} from '@/module/track/application/repository/track.repository.interface';
import { Track } from '@/module/track/domain/track.entity';

@Injectable()
export class TrackService {
  constructor(
    @Inject(TRACK_REPOSITORY_KEY)
    private readonly trackRepository: ITrackRepository,
    private readonly userService: UserService,
    private readonly trackMapper: TrackMapper,
  ) {}

  async getTrackStats(
    getTracksByDateRangeDto: GetTracksByDateRangeDto,
    ownerId: number,
  ): Promise<IGetTrackStatsResponseDto> {
    const startDate = new Date(getTracksByDateRangeDto.startDate);
    const endDate = new Date(getTracksByDateRangeDto.endDate);

    const totalTrackStats =
      await this.trackRepository.getTotalTrackStats(ownerId);
    const tracksLast3MonthsStats =
      await this.trackRepository.getTracksByDateRange(
        startDate,
        endDate,
        ownerId,
      );

    const groupedStats = this.groupStatsByMonth(tracksLast3MonthsStats);

    return {
      totalTrackStats,
      tracksLast3MonthsStats: groupedStats,
    };
  }

  private groupStatsByMonth(tracks: Track[]): ITrackMonthlyStats[] {
    const groupedStats: { [key: string]: { [title: string]: number } } = {};

    tracks.forEach((track) => {
      const date = track.date;
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const title = track.title;

      const key = `${year}-${month}`;

      if (!groupedStats[key]) {
        groupedStats[key] = {};
      }

      if (!groupedStats[key][title]) {
        groupedStats[key][title] = 0;
      }
      groupedStats[key][title]++;
    });

    const result: ITrackMonthlyStats[] = Object.keys(groupedStats).map(
      (key) => {
        const [year, month] = key.split('-').map(Number);
        const moods = Object.entries(groupedStats[key]).map(
          ([title, totalTracks]) => ({
            mood: title,
            totalTracks,
          }),
        );

        return {
          month,
          year,
          moods,
        };
      },
    );

    return result;
  }

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

    const track = this.trackMapper.fromCreateTrackDtoToTrack(
      createTrackDto,
      ownerId,
    );

    const savedTrack = await this.trackRepository.saveOne(track, ownerId);

    return this.trackMapper.fromTrackToTrackResponseDto(savedTrack);
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
