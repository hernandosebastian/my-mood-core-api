import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { UserService } from '@iam/user/application/service/user.service';
import { UserModule } from '@iam/user/user.module';

import { TrackMapper } from '@/module/track/application/mapper/track.mapper';
import { CreateTrackPolicyHandler } from '@/module/track/application/policy/create-track-policy.handler';
import { DeleteTrackPolicyHandler } from '@/module/track/application/policy/delete-track-policy.handler';
import { ReadTrackPolicyHandler } from '@/module/track/application/policy/read-track-policy.handler';
import { UpdateTrackPolicyHandler } from '@/module/track/application/policy/update-track-policy.handler';
import { TRACK_REPOSITORY_KEY } from '@/module/track/application/repository/track.repository.interface';
import { TrackService } from '@/module/track/application/service/track.service';
import { trackPermissions } from '@/module/track/domain/track.permission';
import { TrackMysqlRepository } from '@/module/track/infrastructure/database/track.mysql.repository';
import { TrackSchema } from '@/module/track/infrastructure/database/track.schema';
import { TrackController } from '@/module/track/interface/track.controller';

const policyHandlersProviders = [
  ReadTrackPolicyHandler,
  CreateTrackPolicyHandler,
  UpdateTrackPolicyHandler,
  DeleteTrackPolicyHandler,
];

const trackRepositoryProvider: Provider = {
  provide: TRACK_REPOSITORY_KEY,
  useClass: TrackMysqlRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackSchema]),
    AuthorizationModule.forFeature({ permissions: trackPermissions }),
    UserModule,
  ],
  controllers: [TrackController],
  providers: [
    TrackMapper,
    TrackService,
    trackRepositoryProvider,
    ...policyHandlersProviders,
    UserService,
  ],
  exports: [TrackMapper, TrackService, trackRepositoryProvider],
})
export class TrackModule {}
