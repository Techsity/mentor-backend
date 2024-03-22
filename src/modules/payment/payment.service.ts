import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import axios from 'axios';
import { User } from '../user/entities/user.entity';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';
import { isEnum, isUUID } from 'class-validator';
import { SubscriptionType } from '../subscription/enums/subscription.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from './enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @Inject(REQUEST) private readonly request: { req: { user: User } },
    private configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async makePayment(
    amount: number,
    resourceId: string,
    resourceType: string,
  ): Promise<InitializePaymentResponse> {
    // Validate input
    if (!isEnum(resourceType, SubscriptionType))
      throw new BadRequestException(`Invalid resourceType`);
    if (!isUUID(resourceId))
      throw new BadRequestException(`Invalid ${resourceType} Id`);

    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    const callbackUrl = this.configService.get('PAYMENT_CALLBACK_URL');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const user = this.request.req.user;
    const reference = 'ref' + Date.now();
    const payload = {
      // Todo: calculate to dollar rate
      amount: amount * 100,
      email: user.email,
      currency: 'NGN',
      callback_url: callbackUrl + `/${reference}`,
      reference,
    };
    // create payement record
    const paymentRecord = this.paymentsRepository.create({
      amount,
      currency: payload.currency,
      user_id: user.id,
      reference,
      metadata: { resourceId, resourceType },
    });
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.status == 'true')
        await this.paymentsRepository.save(paymentRecord); //save payment record
      // Todo: send notification to user email including the payment reference
      return {
        reference,
        status: response.data.status,
        authorization_url: response.data.data.authorization_url,
      };
    } catch (error) {
      // payment record won't be saved
      console.error('Payment error:', error);
      const err = new Error('Payment initiation failed');
      this.logger.error(error, err.stack);
      throw err;
    }
  }

  async verifyPayment(reference: string) {
    const user = this.request.req.user;
    const paymentRecord = await this.paymentsRepository.findOne({
      where: { user_id: user.id, reference },
    });
    if (!paymentRecord)
      throw new NotFoundException(
        'We could not find the transaction. The reference might be incorrect',
      );
    // check if payment has been processed
    if (paymentRecord.status === PaymentStatus.SUCCESS)
      throw new BadRequestException('Transaction is already completed');
    if (paymentRecord.status === PaymentStatus.FAILED)
      throw new BadRequestException('Transaction failed. Contact support');

    const response = await axios.get(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
      // Todo: if successful,
      //* payment event - update payment status, subscribe user to course or workshop, notify user of the updates,
      //* notify mentor, update mentor wallet
    );
    console.log({ res: response.data });
    return 'Verified';
  }

  // async addNewCard() {}
  // async getCard() {}
  // async getCards() {}
  // async updateCard() {}
  // async deleteCard() {}

  // async withdrawFunds() {}
}
