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
  async addNewCard(email: string): Promise<any> {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;

    try {
      const response = await axios.post(
        url,
        {
          email: email,
          amount: 50 * 100, // Small amount, representing the card verification fee if applicable
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Ideally, redirect user to this authorization URL or return it to the frontend
      return response.data.data.authorization_url;
    } catch (error) {
      console.error('Error adding new card:', error);
      throw new Error('Failed to initiate card addition');
    }
  }

  async handleSuccessfulCharge(data: any): Promise<void> {
    const authorizationCode = data.authorization.authorization_code;
    const email = data.customer.email;
    // Store the authorization code in your database for future use
    // e.g. this.paymentService.saveAuthorizationCode(email, authorizationCode);
  }

  private async saveAuthorizationCode(
    email: string,
    authorizationCode: string,
  ): Promise<void> {
    // Implement logic to save the authorization code to your database
    // This might involve updating a user's record with the new authorization code
  }


  // async getCard() {}
  // async getCards() {}
  // async updateCard() {}
  // async deleteCard() {}

  // async withdrawFunds() {}
}
