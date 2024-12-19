import { Mood } from '@/module/track/application/enum/mood.enum';

export interface IUpdateTrackDto {
  title?: Mood;
  description?: string;
}
