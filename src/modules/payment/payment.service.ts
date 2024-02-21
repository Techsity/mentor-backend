import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(private configService: ConfigService) {}

  /**
   * TODO: Connect payment gateway
   */
  async makePayment(amount: number, email: string): Promise<any> {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;

    try {
      const response = await axios.post(
        url,
        {
          amount: amount * 100,
          email: email,
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Payment error:', error);
      throw new Error('Payment initiation failed');
    }
  }
  // async addNewCard() {}
  // async getCard() {}
  // async getCards() {}
  // async updateCard() {}
  // async deleteCard() {}

  // async withdrawFunds() {}
}
