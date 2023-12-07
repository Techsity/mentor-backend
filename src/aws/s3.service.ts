import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3, config } from 'aws-sdk';

@Injectable()
export class S3Service {
  private static instance: S3;

  constructor(private configService: ConfigService) {
    if (!S3Service.instance) {
      config.update({
        accessKeyId: this.configService.get<string>('aws.accessKey'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
        region: this.configService.get<string>('aws.region'),
      });
      S3Service.instance = new S3();
    }
  }
  async upload(path, stream, extension) {
    const params = {
      Bucket: this.configService.get<string>('aws.sesBucket'),
      Key: path,
      Body: stream,
      ContentType: this.getContentType(extension),
    };

    try {
      await S3Service.instance.upload(params).promise();
      return true;
    } catch (error) {
      return false;
    }
  }
  getContentType(extension) {
    switch (extension) {
      case '.jpeg':
      case '.jpg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      case '.mp4':
        return 'video/mp4';
      default:
        return 'application/octet-stream'; // generic binary data
    }
  }
}
