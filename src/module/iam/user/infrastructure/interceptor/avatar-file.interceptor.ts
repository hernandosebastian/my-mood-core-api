import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
  UnsupportedMediaTypeException,
  mixin,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Observable } from 'rxjs';

const AVATAR_FIELD_NAME = 'avatar';

export function AvatarFileInterceptor(): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly ONE_MB = 1024 * 1024;
    private readonly MAX_FILE_SIZE = this.ONE_MB;
    private readonly ALLOWED_MIME_TYPES = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
    ];
    private readonly MIME_TYPE_ERROR_MESSAGE =
      'File type not allowed. Accepted formats: PNG, JPG, JPEG and WEBP';

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const multerOptions: MulterOptions = {
        fileFilter: (req, file, callback) => {
          if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            callback(
              new UnsupportedMediaTypeException(this.MIME_TYPE_ERROR_MESSAGE),
              false,
            );
          }

          callback(null, true);
        },
        limits: {
          fileSize: this.MAX_FILE_SIZE,
        },
      };

      try {
        const fileInterceptor = new (FileInterceptor(
          AVATAR_FIELD_NAME,
          multerOptions,
        ))();
        return fileInterceptor.intercept(context, next);
      } catch (error) {
        throw error;
      }
    }
  }

  return mixin(MixinInterceptor);
}
