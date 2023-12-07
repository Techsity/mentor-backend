import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import {
  imageUploadValidation,
  videoUploadValidation,
} from 'src/common/constants';
import { UploadToS3 } from '../../lib/aws.lib';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { fileTypeFromFile } from 'file-type';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
import fs from 'fs';
import { PassThrough } from 'stream';
@Injectable()
export class MediaService {
  constructor(
    // @Inject('RABBITMQ_SERVICE')
    // private readonly client: ClientProxy,
    private readonly uploadToS3: UploadToS3,
  ) {}

  // async onModuleInit() {
  //   await this.client.connect();
  // }

  async uploadImage(file: any): Promise<boolean> {
    const { filename, mimetype, createReadStream } = file;
    const imagePath = `$userId/images/${new Date().toISOString()}-${filename}`;
    const stream = createReadStream();

    const extension = path.extname(filename);

    if (!imageUploadValidation.EXTENSIONS.includes(extension)) {
      throw new BadRequestException('File type not allowed.');
    }

    return this.uploadToS3.upload(imagePath, stream, extension);
  }
  async uploadVideo(user: any, file: any): Promise<string> {
    const { filename, mimetype, createReadStream } = await file;
    const imagePath = `${
      user.id
    }/courses/courseId/videos/${new Date().toISOString()}-${filename}`;
    const stream = createReadStream();

    const extension = path.extname(filename);

    if (!videoUploadValidation.EXTENSIONS.includes(extension)) {
      throw new BadRequestException('File type not allowed.');
    }
    await this.uploadToS3.upload(imagePath, stream, extension);
    return imagePath;
  }

  async uploadVideosConcurrently(user, files: any[]): Promise<string[]> {
    const videoPaths = await Promise.all(
      files.map((file) => this.uploadVideo(user, file)),
    );
    return videoPaths;
  }

  static async getStreamSize(stream) {
    return new Promise((resolve, reject) => {
      const pass = new PassThrough();
      let size = 0;

      stream.pipe(pass);

      pass
        .on('data', (chunk) => {
          size += chunk.length;
        })
        .on('end', () => {
          resolve(size);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
  // @MessagePattern('video_upload_queue')
  // async processVideoUpload(data: any) {
  //   // Process video upload
  //   // Upload video to S3 and update the database
  // }
  //
  // private async queueVideoUploads(user, courseId, files) {
  //   files.forEach((file) => {
  //     const uploadTask = { userId: user.id, courseId: courseId, file: file };
  //     this.client.emit<any>('video_upload_queue', uploadTask);
  //   });
  // }
}
