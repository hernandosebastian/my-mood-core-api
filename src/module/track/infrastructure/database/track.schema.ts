import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Track } from '@/module/track/domain/track.entity';

export const TrackSchema = new EntitySchema<Track>({
  name: 'Track',
  target: Track,
  tableName: 'track',
  columns: withBaseSchemaColumns({
    title: {
      type: String,
    },
    description: {
      type: String,
      nullable: true,
      length: 1000,
    },
    date: {
      type: Date,
    },
    ownerId: {
      type: Number,
      name: 'fk_owner_id',
    },
  }),
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'tracks',
      joinColumn: {
        name: 'fk_owner_id',
      },
    },
  },
});
