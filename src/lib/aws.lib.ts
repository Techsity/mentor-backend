import { S3, config } from 'aws-sdk';

export class UploadToS3 {
  private static instance: S3;

  constructor() {
    if (!UploadToS3.instance) {
      config.update({
        accessKeyId: 'AKIASEPV6TSD2XGQS4TA',
        secretAccessKey: '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',
        region: 'us-west-2',
      });
      UploadToS3.instance = new S3();
    }
  }
  async upload(path, stream, extension) {
    const params = {
      Bucket: 'mentortechsity',
      Key: path,
      Body: stream,
      ContentType: this.getContentType(extension),
    };

    try {
      await UploadToS3.instance.upload(params).promise();
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
