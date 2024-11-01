import { Track } from '@/module/track/domain/track.entity';

export const TRACK_REPOSITORY_KEY = 'track_repository';

export interface ITrackRepository {
  getTracksByDateRange(
    startDate: Date,
    endDate: Date,
    ownerId: number,
  ): Promise<Track[]>;
  getOneById(id: number): Promise<Track>;
  saveOne(track: Track): Promise<Track>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<Track, 'id'>>,
  ): Promise<Track>;
  deleteOneOrFail(id: number): Promise<void>;
}
