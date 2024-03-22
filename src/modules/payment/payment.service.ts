import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
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
import { Workshop } from '../workshop/entities/workshop.entity';
import { Course } from '../course/entities/course.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { SubscriptionService } from '../subscription/services/subscription.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private paystackBaseUrl = 'https://api.paystack.co';
  private secretKey;

  constructor(
    @Inject(REQUEST)
    private readonly request: { req: { user: User } },
    private configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly eventEmitter: EventEmitter2,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
  }

  private async getExchangeRate(): Promise<number> {
    // Fetch exchange rate from an external API
    const response = await axios.get(
      'https://api.exchangerate-api.com/v4/latest/USD',
    );
    return response.data.rates.NGN;
  }

  private async verifyResource(resourceId: string, resourceType: string) {
    // Validate input
    if (!isEnum(resourceType, SubscriptionType))
      throw new BadRequestException(
        `Invalid resourceType | Expected 'course' or 'workshop'`,
      );
    if (!isUUID(resourceId))
      throw new BadRequestException(`Invalid ${resourceType} Id`);
    // confirm if course or workshop exist
    let resource;
    if (resourceType === SubscriptionType.COURSE)
      resource = await this.courseRepository.findOneBy({ id: resourceId });
    else if (resourceType === SubscriptionType.WORKSHOP)
      resource = await this.workshopRepository.findOneBy({ id: resourceId });
    if (!resource) throw new BadRequestException(`Invalid ${resourceType} Id`);
  }

  async makePayment(
    amount: number,
    resourceId: string,
    resourceType: string,
  ): Promise<InitializePaymentResponse> {
    await this.verifyResource(resourceId, resourceType);
    // Get the current usd to ngn exchange rate
    const exchangeRate = await this.getExchangeRate();
    amount = parseInt(amount.toFixed(0)) * exchangeRate;
    console.log({ secretKey: this.secretKey });
    const callbackUrl = this.configService.get('PAYMENT_CALLBACK_URL');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const user = this.request.req.user;
    const reference = 'ref_' + Date.now();
    const metadata = { resourceId, resourceType };

    const payload = {
      amount: amount * 100,
      email: user.email,
      currency: 'NGN',
      callback_url: callbackUrl + `/${reference}`,
      reference,
      metadata: JSON.stringify(metadata),
    };
    // create payement record
    const paymentRecord = this.paymentsRepository.create({
      amount,
      currency: payload.currency,
      user_id: user.id,
      reference,
      metadata,
    });

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (Boolean(response.data.status === true))
        await this.paymentsRepository.save(paymentRecord); //save payment record
      // Todo: send notification to user email including the payment reference
      return {
        reference,
        status: response.data.status,
        authorization_url: response.data.data.authorization_url,
      };
    } catch (error) {
      // payment record won't be saved
      console.error(
        'Payment error:',
        error.response.data || error.response || error,
      );
      const err = new InternalServerErrorException('Payment initiation failed');
      this.logger.error(error, err.stack);
      throw err;
    }
  }

  async verifyPayment(reference: string) {
    const user = this.request.req.user;
    const paymentRecord = await this.paymentsRepository.findOne({
      where: { user_id: user.id, reference },
      relations: ['user'],
    });
    if (!paymentRecord)
      throw new NotFoundException(
        'We could not find the transaction. The reference you provided might be incorrect',
      );
    // check if payment has been processed
    if (paymentRecord.status === PaymentStatus.SUCCESS)
      throw new BadRequestException('Transaction is already completed');
    if (paymentRecord.status === PaymentStatus.FAILED)
      throw new BadRequestException('Transaction failed. Contact support');

    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );
      if (response.data.status !== true)
        throw new UnprocessableEntityException(
          'This request cannot be processed. The reference you provided might be incorrect',
        );
      // subscribe to course or workshop
      let subscription;
      if (paymentRecord.metadata.resourceType === SubscriptionType.COURSE)
        subscription = await this.subscriptionService.subscribeToCourse(
          paymentRecord.metadata.resourceId,
        );
      else if (paymentRecord.metadata.resourceType === SubscriptionType.COURSE)
        subscription = await this.subscriptionService.subscribeToWorkshop(
          paymentRecord.metadata.resourceId,
        );

      this.eventEmitter.emit(EVENTS.PAID_COURSE_SUB_SUCCESSFUL, {
        paymentRecord,
        subscription,
      });
      // console.log({ res: response.data });
      return 'Payment Verified';
    } catch (error) {
      // payment record won't be saved
      console.error(
        'Payment verification error:',
        error.response.data || error.response || error,
      );
      const err = new InternalServerErrorException(
        'Payment verification failed',
      );
      this.logger.error(error, err.stack);
      throw err;
    }
  }

  // async addNewCard() {}
  // async getCard() {}
  // async getCards() {}
  // async updateCard() {}
  // async deleteCard() {}

  // async withdrawFunds() {}
}
