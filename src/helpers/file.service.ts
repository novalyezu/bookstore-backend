import { v2 as cloudinary } from 'cloudinary';
import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AppLogger } from "./logger.service";
import { RequestContext } from "./request-context.decorator";

@Injectable()
export class FileService {
  constructor(
    @Inject('FILE_BUCKET')
    private bucket: string,
    @Inject('FILE_CLOUD_NAME')
    private cloudName: string,
    private logger: AppLogger,
  ) {
    this.logger.setContext(FileService.name);
  }
  private CLOUD_IMAGE_URL = `https://res.cloudinary.com/${this.cloudName}/image/upload/`

  async upload(ctx: RequestContext, file: Express.Multer.File, folderDest: string): Promise<string> {
    this.logger.log(ctx, `${this.upload.name} called`);

    const splittedName = file.originalname.split('.');
    const ext = splittedName[splittedName.length - 1];
    const options = {
      unique_filename: false,
      overwrite: true,
      folder: this.bucket + folderDest,
      resource_type: 'auto' as any,
    };

    const uploadResult: any = await new Promise((resolve) => {
      cloudinary.uploader.upload_stream(options, (error, uploadResult) => {
        if (error) {
          throw new InternalServerErrorException('Internal Server Error');
        }
        return resolve(uploadResult);
      }).end(file.buffer);
    });

    return this.CLOUD_IMAGE_URL + uploadResult.public_id + '.' + ext;
  }

  async remove(ctx: RequestContext, url: string, type: 'image' | 'video'): Promise<void> {
    this.logger.log(ctx, `${this.remove.name} called`);

    const publicId = url.replace(this.CLOUD_IMAGE_URL, '').split('.');
    publicId.pop();
    await cloudinary.uploader.destroy(publicId.join(), {
      resource_type: type
    });
  }
}