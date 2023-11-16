import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SES } from 'aws-sdk';

@Injectable()
export class MailerService {
  private ses: SES;
  private recipients: string[];
  constructor(private configService: ConfigService) {
    this.ses = new SES({
      region: this.configService.get<string>('ses.region'),
      accessKeyId: this.configService.get<string>('ses.accessKey'),
      secretAccessKey: this.configService.get<string>('ses.secretAccessKey'),
    });
    this.recipients = ['oluwasegunstar@gmail.com'];
  }
  async sendCrashReport(error: any) {
    try {
      const text = `The file upload failed. Please contact an admin.<br/><br/>Error: ${error}`;
      await this.sendMail(
        `PE Promotions Update Failed - ${
          process.env.NODE_CONFIG_ENV || 'development'
        }`,
        text,
      );
      return text;
    } catch (err) {
      throw new Error(`sendCrashReport():\n ${err}`);
    }
  }

  async sendErrorReport(errors: string[]) {
    try {
      const text = `The upload of new Payment Estimator - Promotions data file could not be completed due to following reasons:
      ${errors}`;
      await this.sendMail(
        `PE Promotions DB Update Failed - ${
          process.env.NODE_CONFIG_ENV || 'development'
        }`,
        text,
      );
      return text;
    } catch (err) {
      throw new Error(`sendErrorReport():\n ${err}`);
    }
  }

  async sendSuccessReport(warnings?: string[]) {
    try {
      let text =
        'New data has been successfully uploaded into Payment Estimator - Promotions database.<br/><br/>';
      if (warnings?.length) {
        text += 'Warnings:<br/>';
        text += warnings.join('<br/>');
      }

      await this.sendMail(
        `PE Promotions DB Update Successful - ${
          process.env.NODE_CONFIG_ENV || 'development'
        }`,
        text,
      );
      return text;
    } catch (err) {
      throw new Error(`sendSuccessReport():\n ${err}`);
    }
  }
  async sendMail(subject: string, text: string): Promise<void> {
    const params: SES.SendEmailRequest = {
      Source: this.configService.get('ses.sender'),
      Destination: {
        ToAddresses: this.recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: text,
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      console.log(result);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}
