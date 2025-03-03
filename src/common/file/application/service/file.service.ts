import { Inject } from '@nestjs/common';

import {
  FILE_SERVICE_KEY,
  IFileService,
} from '@common/file/application/service/file.service.interface';

export class FileService {
  constructor(
    @Inject(FILE_SERVICE_KEY)
    private readonly fileService: IFileService,
  ) {}

  async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    return this.fileService.saveFile(file, folder);
  }

  async deleteFile(fileName: string, folder: string): Promise<void> {
    return this.fileService.deleteFile(fileName, folder);
  }
}
