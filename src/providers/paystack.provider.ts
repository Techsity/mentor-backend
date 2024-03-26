import { ConfigService } from '@nestjs/config';

export default class PaystackProvider {
  private paystackBaseUrl = 'https://api.paystack.co';
  private configService: ConfigService = new ConfigService();
  private secretKey = this.configService.get('PAYSTACK_SECRET_KEY');

  async verifyBankAccount() {
    // Todo
  }
}
