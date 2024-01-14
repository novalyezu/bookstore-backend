import { v2 as cloudinary } from 'cloudinary';
import { DynamicModule, Module } from '@nestjs/common';
import { FileService } from './file.service';

@Module({})
export class FileModule {
  static register(options: FileOptions): DynamicModule {
    const FileProvider = {
      provide: 'FILE',
      useFactory: () => {
        return cloudinary.config({
          secure: true,
          cloud_name: options.cloudName,
          api_key: options.apiKey,
          api_secret: options.apiSecret,
        });
      },
    };

    const FileBucket = {
      provide: 'FILE_BUCKET',
      useValue: options.bucket,
    };

    const FileCloudName = {
      provide: 'FILE_CLOUD_NAME',
      useValue: options.cloudName,
    };

    return {
      global: true,
      module: FileModule,
      providers: [FileProvider, FileBucket, FileCloudName, FileService],
      exports: [FileProvider, FileBucket, FileCloudName, FileService],
    };
  }
}

export interface FileOptions {
  bucket: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}
