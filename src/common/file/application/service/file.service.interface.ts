export const FILE_SERVICE_KEY = 'file_service';

export interface IFileService {
  saveFile: (file: Express.Multer.File, folder: string) => Promise<string>;
  deleteFile: (fileName: string) => Promise<void>;
}
