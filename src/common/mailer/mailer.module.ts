import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { SesService } from '../../aws/ses.service';
import { MailerService } from './mailer.service';
@Module({
  imports: [AwsModule],
  providers: [MailerService, SesService],
})
export class MailerModule {}
