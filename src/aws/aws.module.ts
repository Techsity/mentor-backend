import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { SesService } from './ses.service';

@Module({
  providers: [S3Service, SesService],
  exports:[SesService]
})
export class AwsModule {}
