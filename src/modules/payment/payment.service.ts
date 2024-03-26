import {
  BadRequestException,
  HttpStatus,
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
import { CustomResponseMessage, CustomStatusCodes } from 'src/common/constants';
import { Subscription } from '../subscription/entities/subscription.entity';

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
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
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
    const user = this.request.req.user;
    const sub = await this.subscriptionRepository.findOne({
      where: [
        {
          course_id: resourceId,
          type: resourceType as SubscriptionType,
          user: { id: user.id },
        },
        {
          workshop_id: resourceId,
          type: resourceType as SubscriptionType,
          user: { id: user.id },
        },
      ],
    });

    if (sub) throw new BadRequestException('Already subscribed');

    // Get the current usd to ngn exchange rate
    const exchangeRate = await this.getExchangeRate();
    amount = parseInt(amount.toFixed(0)) * exchangeRate;

    const callbackUrl = this.configService.get('PAYMENT_CALLBACK_URL');
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const reference = 'ref_' + Date.now();
    const metadata = {
      resourceId,
      resourceType: resourceType as SubscriptionType,
    };

    // create payement record
    let paymentRecord = await this.paymentsRepository.findOne({
      where: { metadata },
    });
    if (paymentRecord && paymentRecord.status !== PaymentStatus.SUCCESS) {
      return {
        authorization_url: `https://checkout.paystack.com/${paymentRecord.access_code}`,
        reference: paymentRecord.reference,
        status: 'true',
      };
    } else
      paymentRecord = this.paymentsRepository.create({
        amount,
        currency: 'NGN',
        user_id: user.id,
        reference,
        metadata,
      });

    const payload = {
      amount: amount * 100,
      email: user.email,
      currency: paymentRecord.currency,
      callback_url: callbackUrl + `/${reference}`,
      reference: paymentRecord.reference,
      metadata: JSON.stringify(metadata),
    };
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (
        Boolean(response.data.status === true) &&
        response.data.data.authorization_url
      )
        //save payment record
        await this.paymentsRepository.save({
          ...paymentRecord,
          access_code: response.data.data.access_code,
        });
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

    // redirect if payment was abandoned
    if (paymentRecord.status === PaymentStatus.SUCCESS)
      throw new BadRequestException('Transaction is already completed');
    else if (paymentRecord.status === PaymentStatus.FAILED)
      throw new BadRequestException('Transaction failed. Contact support');
    // else if (paymentRecord.status === PaymentStatus.ABANDONED)
    //   throw new UnprocessableEntityException(
    //     CustomResponseMessage.getErrorMessage(
    //       CustomStatusCodes.ABANDONED_PAYMENT,
    //     ).concat(` | ${paymentRecord.access_code}`),
    //   );

    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (response.data.data.status === 'abandoned') {
        throw new UnprocessableEntityException(
          CustomResponseMessage.getErrorMessage(
            CustomStatusCodes.ABANDONED_PAYMENT,
          ).concat(` | ${paymentRecord.access_code}`),
        );
      }
      if (response.data.status !== true)
        throw new UnprocessableEntityException(
          'This request cannot be processed. The reference you provided might be incorrect',
        );

      // subscribe to course or workshop
      let subscription;
      if (!subscription) {
        if (paymentRecord.metadata.resourceType === SubscriptionType.COURSE)
          subscription = await this.subscriptionService.subscribeToCourse(
            paymentRecord.metadata.resourceId,
          );
        else if (
          paymentRecord.metadata.resourceType === SubscriptionType.WORKSHOP
        )
          subscription = await this.subscriptionService.subscribeToWorkshop(
            paymentRecord.metadata.resourceId,
          );
      }
      this.eventEmitter.emit(EVENTS.PAID_COURSE_SUB_SUCCESSFUL, {
        paymentRecord,
        subscription,
      });
      // console.log({ res: response.data });
      // return 'Payment Verified';
      return subscription;
    } catch (error) {
      console.log({ error });
      // payment record won't be saved
      const errMsg = new Error('Payment verification error');
      this.logger.error(error, errMsg.stack);
      if (error.status === HttpStatus.UNPROCESSABLE_ENTITY) throw error;
      throw new InternalServerErrorException(errMsg.message);
    }
  }

  // async addNewCard() {}
  // async getCard() {}
  // async getCards() {}
  // async updateCard() {}
  // async deleteCard() {}

  // async withdrawFunds() {}
}
