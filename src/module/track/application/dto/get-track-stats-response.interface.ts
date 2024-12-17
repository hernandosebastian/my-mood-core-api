import { ITrackStats } from '@/module/track/application/dto/total-track-stats-response.interface';
import { ITrackMonthlyStats } from '@/module/track/application/dto/track-monthly-stats.response.interface';

export interface IGetTrackStatsResponseDto {
  totalTrackStats: ITrackStats[];
  tracksLast3MonthsStats: ITrackMonthlyStats[];
}
