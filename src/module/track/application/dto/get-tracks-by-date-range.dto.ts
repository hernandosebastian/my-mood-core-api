import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { Track } from '@/module/track/domain/track.entity';

export class GetTracksByDateRangeDto {
  options: IGetAllOptions<Track>;
  startDate: Date;
  endDate: Date;
}
