import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import axios from 'axios';
import { User } from '../user/entities/user.entity';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @Inject(REQUEST) private readonly request: { req: { user: User } },
    private configService: ConfigService,
  ) {}

  async makePayment(amount: number): Promise<InitializePaymentResponse> {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    const callbackUrl = this.configService.get('PAYMENT_CALLBACK_URL');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const user = this.request.req.user;
    const reference = 'ref' + Date.now();
    const payload = {
      amount: amount * 100,
      email: user.email,
      currency: 'NGN',
      callback_url: callbackUrl + `/${reference}`,
      reference,
    };
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      // Todo: send notification to user
      return {
        reference,
        status: response.data.status,
        authorization_url: response.data.data.authorization_url,
      };
    } catch (error) {
      console.error('Payment error:', error);
      const err = new Error('Payment initiation failed');
      this.logger.error(error, err.stack);
      throw err;
    }
  }

  // Todo: verifyPayment

  // async addNewCard() {}
  // async getCard() {}
  // async getCards() {}
  // async updateCard() {}
  // async deleteCard() {}

  // async withdrawFunds() {}
}
