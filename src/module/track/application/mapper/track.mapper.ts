import { Injectable } from '@nestjs/common';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';
import { TrackResponseDto } from '@/module/track/application/dto/track-response.dto';
import { IUpdateTrackDto } from '@/module/track/application/dto/update-track.dto.interface';
import { Track } from '@/module/track/domain/track.entity';

@Injectable()
export class TrackMapper {
  fromCreateTrackDtoToTrack(trackDto: ICreateTrackDto): Track {
    const track = new Track();
    track.title = trackDto.title;
    track.description = trackDto.description;
    track.date = trackDto.date;
    track.ownerId = trackDto.ownerId;
    return track;
  }

  fromUpdateTrackDtoToTrack(trackDto: IUpdateTrackDto): Track {
    const track = new Track();
    track.title = trackDto.title;
    track.description = trackDto.description;
    track.ownerId = trackDto.ownerId;
    track.date = trackDto.date;
    return track;
  }

  fromTrackToTrackResponseDto(track: Track): TrackResponseDto {
    const trackResponseDto = new TrackResponseDto();
    trackResponseDto.id = track.id;
    trackResponseDto.title = track.title;
    trackResponseDto.description = track.description;
    trackResponseDto.date = track.date;
    trackResponseDto.ownerId = track.ownerId;
    trackResponseDto.createdAt = track.createdAt;
    trackResponseDto.updatedAt = track.updatedAt;
    trackResponseDto.deletedAt = track.deletedAt;
    return trackResponseDto;
  }
}
