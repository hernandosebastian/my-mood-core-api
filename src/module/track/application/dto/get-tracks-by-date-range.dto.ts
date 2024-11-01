import { IsDateString } from 'class-validator';

export class GetTracksByDateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
