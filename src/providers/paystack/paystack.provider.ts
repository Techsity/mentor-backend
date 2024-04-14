import {
  BadRequestException,
  Global,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChargeAccountResponse,
  PaystackInitializePaymentInput,
  PaystackInitializePaymentResponse,
  PaystackVerifyTransactionResponse,
} from './paystack.interface';
import axios, { AxiosResponse } from 'axios';
import { ISOCurrency } from 'src/modules/payment/types/payment.type';
import { InitializePaymentInput } from 'src/modules/payment/dto/initialize-payment-input.dto';

@Injectable()
export default class PaystackProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private paystackBaseUrl = 'https://api.paystack.co';
  private secretKey;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
  }

  private async request(path: string, payload?: object) {
    const url = `${this.paystackBaseUrl}${path}`;
    return await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async validateAccount(accountNumber: string, bankCode: string) {}

  async chargeAccount(
    input: InitializePaymentInput & { email: string },
  ): Promise<ChargeAccountResponse> {
    const { accountNumber, amount, bankCode, birthday, email } = input;
    const payload = {
      email,
      amount: amount * 100,
      bank: { code: bankCode, account_number: accountNumber },
      birthday,
    };
    const { data: res } = await this.request('/charge', payload);
    return res;
  }

  async verifyChargeOTP(ref: string, otp: string) {
    const payload = { otp, reference: ref };
    const { data: data } = await this.request('/charge/submit_otp', payload);
    return data as PaystackVerifyTransactionResponse;
  }

  async getExchangeRate(currency: ISOCurrency): Promise<number> {
    try {
      // Fetch exchange rate from an external API
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${currency}`,
      );
      return response.data.rates.NGN; // rates to naira
    } catch (error) {
      throw error;
    }
  }
}
