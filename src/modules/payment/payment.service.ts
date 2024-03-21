import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import axios from 'axios';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @Inject(REQUEST) private readonly request: { req: { user: User } },
    private configService: ConfigService,
  ) {}

  async makePayment(amount: number): Promise<any> {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const user = this.request.req.user;
    const payload = {
      amount: amount * 100,
      email: user.email,
      currency: 'NGN',
    };
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      console.log({ data: response.data, response });
      return response.data;
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
