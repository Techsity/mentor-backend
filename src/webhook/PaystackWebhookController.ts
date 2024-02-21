import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from '../modules/payment/payment.service'; // Adjust the path as necessary

@Controller('paystack')
export class PaystackWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(
    @Req() request: Request,
    @Body() body: any,
  ): Promise<void> {
    // Handle the event
    if (body.event === 'charge.success') {
      await this.paymentService.handleSuccessfulCharge(body.data);
    }
  }
}
