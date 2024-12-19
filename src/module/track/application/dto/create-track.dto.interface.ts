import { Mood } from '@/module/track/application/enum/mood.enum';

export interface ICreateTrackDto {
  title: Mood;
  description?: string;
  date: Date;
}
