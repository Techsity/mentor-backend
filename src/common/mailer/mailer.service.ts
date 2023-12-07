import { Injectable } from '@nestjs/common';
import { SesService } from '../../aws/ses.service';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class MailerService {
  constructor(private sesService: SesService) {}
  async sendOtpEmail(to: string, name: string, otp: string) {
    try {
      let templateSource;
      try {
        templateSource = fs.readFileSync(
          path.join(__dirname, './templates', 'otp.template.hbs'),
          'utf-8',
        );
      } catch (error) {
        throw new Error(`sendOtpEmail():\n ${error}`);
      }
      const template = handlebars.compile(templateSource);

      const htmlBody = template({ otp, name });
      return await this.sesService.sendEmail(
        to,
        '[Action required] Verify your Mentor account to get started',
        htmlBody,
      );
    } catch (err) {
      console.log(err);
      throw new Error(`sendOtpEmail():\n ${err}`);
    }
  }
}
