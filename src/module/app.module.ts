import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { ThrottlerExceptionFilter } from '@common/filter/throttler-exception.filter';

import { environmentConfig } from '@config/environment.config';
import { ENVIRONMENT } from '@config/environment.enum';
import { datasourceOptions } from '@config/orm.config';

import { IamModule } from '@iam/iam.module';

import { HealthController } from '@/module/health/interface/health.controller';
import { TrackModule } from '@/module/track/track.module';

const providers: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: ThrottlerExceptionFilter,
  },
];

const currentEnv = process.env.NODE_ENV;

if (
  currentEnv === ENVIRONMENT.PRODUCTION ||
  currentEnv === ENVIRONMENT.STAGING
) {
  providers.push({
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  });
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [environmentConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...datasourceOptions,
        autoLoadEntities: true,
      }),
      dataSourceFactory: async (options) => {
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('rateLimiting.ttl');
        const limit = configService.get<number>('rateLimiting.limit');
        return [
          {
            ttl,
            limit,
          },
        ];
      },
    }),
    IamModule,
    TrackModule,
  ],
  controllers: [HealthController],
  providers: [...providers],
})
export class AppModule {}
