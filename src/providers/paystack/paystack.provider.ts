import { Global, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaystackInitializePaymentInput,
  PaystackInitializePaymentResponse,
  PaystackVerifyTransactionResponse,
} from './paystack.interface';
import axios from 'axios';
import { ISOCurrency } from 'src/modules/payment/types/payment.type';

@Injectable()
export default class PaystackProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private paystackBaseUrl = 'https://api.paystack.co';
  private secretKey;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
  }

  async initializePayment(
    input: PaystackInitializePaymentInput,
  ): Promise<PaystackInitializePaymentResponse> {
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const { payload } = input;
    payload.callback_url =
      payload.callback_url || this.configService.get('PAYMENT_CALLBACK_URL');
    const reference = 'ref_' + Date.now();
    payload.metadata = JSON.stringify(payload.metadata) as any;
    payload.amount = parseInt(String(payload.amount));
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      return {
        reference,
        status: response.data.status,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
      };
    } catch (error) {
      const err = new Error(error.message);
      this.logger.error(err, err.stack);
      throw error;
    }
  }

  async verifyTransaction(
    ref: string,
  ): Promise<PaystackVerifyTransactionResponse> {
    if (!ref) throw new Error("'ref' not provided for verifying transaction");
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${ref}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );
      return { status: response.data.data.status };
    } catch (error) {
      const err = new Error(error.message);
      this.logger.error(err, err.stack);
      throw error;
    }
  }

  async getExchangeRate(currency: ISOCurrency): Promise<number> {
    try {
      // Fetch exchange rate from an external API
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${currency}`,
      );
      return response.data.rates.NGN;
    } catch (error) {
      throw error;
    }
  }
}
