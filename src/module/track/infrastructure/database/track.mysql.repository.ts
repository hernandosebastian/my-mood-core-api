import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { ITrackRepository } from '@/module/track/application/repository/track.repository.interface';
import { Track } from '@/module/track/domain/track.entity';
import { TrackNotFoundException } from '@/module/track/infrastructure/database/exception/track-not-found.exception';
import { TrackSchema } from '@/module/track/infrastructure/database/track.schema';

export class TrackMysqlRepository implements ITrackRepository {
  constructor(
    @InjectRepository(TrackSchema)
    private readonly repository: Repository<Track>,
  ) {}

  async getTracksByDateRange(
    startDate: Date,
    endDate: Date,
    ownerId: number,
  ): Promise<Track[]> {
    return this.repository.find({
      where: {
        date: Between(startDate, endDate),
        ownerId,
      },
    });
  }

  async saveOne(track: Track): Promise<Track> {
    return this.repository.save(track);
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<Track, 'id'>>,
  ): Promise<Track> {
    const trackToUpdate = await this.repository.preload({
      ...updates,
      id,
    });

    if (!trackToUpdate) {
      throw new TrackNotFoundException(`Track with ID ${id} not found`);
    }

    return this.repository.save(trackToUpdate);
  }

  async deleteOneOrFail(id: number): Promise<void> {
    const trackToDelete = await this.repository.findOne({ where: { id } });

    if (!trackToDelete) {
      throw new TrackNotFoundException(`Track with ID ${id} not found`);
    }

    await this.repository.softDelete(id);
  }
}
