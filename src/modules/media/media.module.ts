import { Module } from '@nestjs/common';
import { UploadToS3 } from '../../lib/aws.lib';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';

@Module({
  providers: [MediaResolver, MediaService, UploadToS3],
  exports: [MediaService],
})
export class MediaModule {}
