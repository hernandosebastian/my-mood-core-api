import { PartialType } from '@nestjs/swagger';

import { CreateTrackDto } from '@/module/track/application/dto/create-track.dto';

export class UpdateTrackDto extends PartialType(CreateTrackDto) {}
