import {
  BadRequestException,
  Global,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BankDTO,
  ChargeAccountResponse,
  PaystackInitializePaymentInput,
  PaystackInitializePaymentResponse,
  PaystackVerifyTransactionResponse,
  ValidateAccountNumberResponse,
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

  private async request(
    path: string,
    payload?: object,
    method?: 'POST' | 'GET',
  ) {
    const url = `${this.paystackBaseUrl}${path}`;
    return await axios(url, {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      method: method || 'POST',
      data: payload,
    });
  }

  async validateAccount(accountNumber: string, bankCode: string) {
    const { data: isValidAcct } = await this.request(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      undefined,
      'GET',
    );
    return isValidAcct as ValidateAccountNumberResponse;
  }

  async chargeAccount(
    input: InitializePaymentInput & { email: string },
  ): Promise<ChargeAccountResponse> {
    const { accountNumber, amount, bankCode, birthday, email } = input;
    const payload = {
      email,
      amount: parseInt(amount.toFixed(0)) * 100,
      bank: { code: bankCode, account_number: accountNumber },
      currency: input.currency,
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

  async confirmPendingCharge(
    ref: string,
  ): Promise<PaystackVerifyTransactionResponse> {
    const { data: data } = await this.request(
      `/charge/${ref}`,
      undefined,
      'GET',
    );
    return data;
  }

  async fetchBanks() {
    const { data } = await this.request(
      '/bank?pay_with_bank=true&country=nigeria',
      undefined,
      'GET',
    );
    return data.data as BankDTO[];
  }

  async getExchangeRate(currency: ISOCurrency): Promise<number> {
    try {
      // Fetch exchange rate
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${currency}`,
      );
      return response.data.rates.NGN; // rates against naira
    } catch (error) {
      throw error;
    }
  }
}
