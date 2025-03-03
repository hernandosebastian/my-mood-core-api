import { Module } from '@nestjs/common';

import { FileService } from '@common/file/application/service/file.service';

import { FILE_SERVICE_KEY } from './application/service/file.service.interface';
import { S3Service } from './infrastructure/s3/s3.service';

@Module({
  providers: [
    FileService,
    {
      provide: FILE_SERVICE_KEY,
      useClass: S3Service,
    },
  ],
  exports: [
    FileService,
    {
      provide: FILE_SERVICE_KEY,
      useClass: S3Service,
    },
  ],
})
export class FileModule {}
