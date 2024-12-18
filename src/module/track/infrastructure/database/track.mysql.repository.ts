import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { ITrackStats } from '@/module/track/application/dto/total-track-stats-response.interface';
import { ITrackRepository } from '@/module/track/application/repository/track.repository.interface';
import { Track } from '@/module/track/domain/track.entity';
import { TrackConflictException } from '@/module/track/infrastructure/database/exception/track-conflict.exception';
import { TrackNotFoundException } from '@/module/track/infrastructure/database/exception/track-not-found.exception';
import { TrackSchema } from '@/module/track/infrastructure/database/track.schema';

export class TrackMysqlRepository implements ITrackRepository {
  constructor(
    @InjectRepository(TrackSchema)
    private readonly repository: Repository<Track>,
  ) {}

  async getTotalTrackStats(ownerId: number): Promise<ITrackStats[]> {
    return await this.repository
      .createQueryBuilder('track')
      .select(['track.title AS mood', 'COUNT(track.id) AS totalTracks'])
      .where('track.ownerId = :ownerId', { ownerId })
      .groupBy('track.title')
      .orderBy('totalTracks', 'DESC')
      .getRawMany();
  }

  async existsForDate(date: Date, ownerId: number): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.repository.count({
      where: {
        ownerId,
        date: Between(startOfDay, endOfDay),
      },
    });

    return count > 0;
  }

  async getTracksByDateRange(
    startDate: Date,
    endDate: Date,
    ownerId: number,
  ): Promise<Track[]> {
    return this.repository.find({
      where: {
        ownerId,
        date: Between(startDate, endDate),
      },
    });
  }

  async getOneById(id: number): Promise<Track> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async saveOne(track: Track, ownerId: number): Promise<Track> {
    const trackDate = track.date;

    const trackExists = await this.existsForDate(trackDate, ownerId);
    if (trackExists) {
      throw new TrackConflictException(
        `A track already exists for the date ${trackDate.toDateString()}`,
      );
    }

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
