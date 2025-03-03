/* istanbul ignore file */
import { PutObjectCommandInput, S3, S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { IFileService } from '@common/file/application/service/file.service.interface';

import { ENVIRONMENT } from '@config/environment.enum';

@Injectable()
export class S3Service implements IFileService {
  private readonly s3: S3;

  constructor(private readonly configService: ConfigService) {
    const devConfig: S3ClientConfig = {
      region: this.configService.get('s3.region'),
      endpoint: this.configService.get('s3.localEndpoint'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
    };

    const prodConfig: S3ClientConfig = {
      region: this.configService.get('s3.region'),
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
    };

    this.s3 = new S3(
      process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ? prodConfig : devConfig,
    );
  }

  async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileNameEncoded = uuidv4() + path.extname(file?.originalname);

    const uploadParams = await this.createSaveFileParams(
      fileNameEncoded,
      file,
      folder,
    );

    const upload = new Upload({
      client: this.s3,
      params: uploadParams,
    });

    await upload.done();

    return fileNameEncoded;
  }

  private async createSaveFileParams(
    fileNameEncoded: string,
    file: Express.Multer.File,
    folder: string,
  ): Promise<PutObjectCommandInput> {
    return {
      Bucket: this.configService.get('s3.bucketName'),
      Body: file.buffer,
      Key: `${folder}${fileNameEncoded}`,
      ACL: 'public-read' as const,
      ContentType: file.mimetype,
    };
  }

  async deleteFile(fileName: string): Promise<void> {
    const deleteParams = {
      Bucket: this.configService.get('s3.bucketName'),
      Key: fileName,
    };

    await this.s3.deleteObject(deleteParams);
  }
}
