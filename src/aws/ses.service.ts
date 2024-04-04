import { Injectable, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Global()
@Injectable()
export class SesService {
  private ses: AWS.SES;

  constructor(private configService: ConfigService) {
    AWS.config.update({
      accessKeyId: this.configService.get<string>('aws.accessKey'),
      secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      region: this.configService.get<string>('aws.region'),
    });

    this.ses = new AWS.SES();
  }

  async sendEmail(to: string, subject: string, htmlBody: string) {
    const params: AWS.SES.SendEmailRequest = {
      ConfigurationSetName: 'Mentor',
      Source: this.configService.get<string>('aws.emailSender'),
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: htmlBody,
          },
        },
      },
    };

    try {
      const response = await this.ses.sendEmail(params).promise();
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
