import { Injectable, Logger } from '@nestjs/common';
import { SesService } from '../../aws/ses.service';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  constructor(private sesService: SesService) {}
  async sendOtpEmail(to: string, name: string, otp: string) {
    try {
      const templatePath = path.resolve(
        __dirname,
        './templates',
        'otp.template.hbs',
      );
      const templateSource = await fs.promises.readFile(templatePath, 'utf-8');

      if (!templateSource) {
        const stackTrace = new Error().stack;
        this.logger.error('Error loading otp email template', stackTrace);
        throw new Error(`Error loading otp email template`);
      }
      const template = handlebars.compile(templateSource);

      const htmlBody = template({ otp, name });
      return await this.sesService.sendEmail(
        to,
        '[Action required] Verify your Mentor account to get started',
        htmlBody,
      );
    } catch (err) {
      const stackTrace = new Error().stack;
      this.logger.error(err, stackTrace);
      throw new Error(`Error Sending Otp`);
    }
  }
}
