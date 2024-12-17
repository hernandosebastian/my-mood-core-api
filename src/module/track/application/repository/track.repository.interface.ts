import { ITrackStats } from '@/module/track/application/dto/total-track-stats-response.interface';
import { ITrackMonthlyStats } from '@/module/track/application/dto/track-monthly-stats.response.interface';
import { Track } from '@/module/track/domain/track.entity';

export const TRACK_REPOSITORY_KEY = 'track_repository';

export interface ITrackRepository {
  getTotalTrackStats(ownerId: number): Promise<ITrackStats[]>;
  getTracksLast3MonthsStats(ownerId: number): Promise<ITrackMonthlyStats[]>;
  existsForDate(date: Date, ownerId: number): Promise<boolean>;
  getTracksByDateRange(
    startDate: Date,
    endDate: Date,
    ownerId: number,
  ): Promise<Track[]>;
  getOneById(id: number): Promise<Track>;
  saveOne(track: Track, ownerId: number): Promise<Track>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<Track, 'id'>>,
  ): Promise<Track>;
  deleteOneOrFail(id: number): Promise<void>;
}
