import { ITrackStats } from '@/module/track/application/dto/total-track-stats-response.interface';

export interface ITrackMonthlyStats {
  month: number;
  year: number;
  moods: ITrackStats[];
}
