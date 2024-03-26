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
import PaystackProvider from 'src/providers/paystack/paystack.provider';
import Decimal from 'decimal.js';
import { ISOCurrency } from './types/payment.type';
import { Appointment } from '../appointment/entities/appointment.entity';
import VerifyPaymentDTO from './dto/verify-payment.response';
import { AppointmentStatus } from '../appointment/enums/appointment.enum';

@Injectable()
export class PaymentService {
  private readonly logger: Logger = new Logger(PaymentService.name);

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
    private paystackService: PaystackProvider,
  ) {}

  private async validatePaymentInput(resourceId: string, resourceType: string) {
    // Validate input
    if (!isEnum(resourceType, SubscriptionType))
      throw new BadRequestException(
        `Invalid resourceType | Expected either 'course' or 'workshop' o 'mentorship_appointment'`,
      );
    if (!isUUID(resourceId))
      throw new BadRequestException(`Invalid ${resourceType} Id`);
    // confirm if course or workshop exist
    if (resourceType !== SubscriptionType.MENTORSHIP_APPOINTMENT) {
      let resource;
      if (resourceType === SubscriptionType.COURSE)
        resource = await this.courseRepository.findOneBy({ id: resourceId });
      else if (resourceType === SubscriptionType.WORKSHOP)
        resource = await this.workshopRepository.findOneBy({ id: resourceId });
      if (!resource)
        throw new BadRequestException(`Invalid ${resourceType} Id`);
    }
  }

  async initiatePayment(
    amount: number,
    resourceId: string,
    resourceType: string,
    currency: ISOCurrency,
  ): Promise<InitializePaymentResponse> {
    await this.validatePaymentInput(resourceId, resourceType);
    const user = this.request.req.user;

    if (resourceType !== SubscriptionType.MENTORSHIP_APPOINTMENT) {
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
    }
    // Get the currency's exchange rate to NGN
    const exchangeRate = await this.paystackService.getExchangeRate(currency),
      amountDesc = new Decimal(amount * exchangeRate);

    const reference = 'ref_' + Date.now(),
      metadata = {
        resourceId,
        resourceType: resourceType as SubscriptionType,
      };
    let callbackUrl = this.configService.get('PAYMENT_CALLBACK_URL');

    // Cancel exisiting pending payments for the resource
    this.eventEmitter.emit(EVENTS.CANCEL_EXISTING_PAYMENT, { metadata, user });

    //* create payement record
    const paymentRecord = this.paymentsRepository.create({
      amount: Number(amountDesc.toFixed(2)),
      currency,
      user_id: user.id,
      exchange_rate: exchangeRate,
      reference,
      metadata,
    });

    const payload = {
      amount: Number(new Decimal(Number(amountDesc) * 100).toFixed(2)),
      email: user.email,
      currency: ISOCurrency.NGN,
      callback_url: callbackUrl + `/${reference}`,
      reference: paymentRecord.reference,
      metadata,
    };
    try {
      const response = await this.paystackService.initializePayment({
        payload,
      });
      if (Boolean(response.status) && response.authorization_url)
        //save payment record
        await this.paymentsRepository.save({
          ...paymentRecord,
          access_code: response.access_code,
        });
      // Todo: send notification to user email with a link to verify their payment
      return {
        reference,
        status: String(response.status),
        authorization_url: response.authorization_url,
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

  async verifyPayment(reference: string): Promise<VerifyPaymentDTO> {
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
    else if (paymentRecord.status === PaymentStatus.FAILED)
      throw new BadRequestException('Transaction failed. Contact support');

    try {
      const { status } = await this.paystackService.verifyTransaction(
        reference,
      );

      if (status === 'abandoned')
        throw new UnprocessableEntityException(
          CustomResponseMessage.getErrorMessage(
            CustomStatusCodes.ABANDONED_PAYMENT,
          ).concat(` | ${paymentRecord.access_code}`),
        );

      if (status !== 'success')
        throw new UnprocessableEntityException(
          'This request cannot be processed. The reference you provided might be incorrect',
        );

      if (
        paymentRecord.metadata.resourceType ===
        SubscriptionType.MENTORSHIP_APPOINTMENT
      ) {
        return await this.processAppointmentPayment(paymentRecord);
      } else {
        // subscribe to course or workshop
        let subscription;

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

        this.eventEmitter.emit(EVENTS.PAID_COURSE_SUB_SUCCESSFUL, {
          paymentRecord,
          subscription,
        });
        // console.log({ res: response.data });
        // return 'Payment Verified';
        return { subscription };
      }
    } catch (error) {
      console.log({ error });
      // payment record won't be saved
      const errMsg = new Error('Payment verification error');
      this.logger.error(error, errMsg.stack);
      if (error.status === HttpStatus.UNPROCESSABLE_ENTITY) throw error;
      throw new InternalServerErrorException(errMsg.message);
    }
  }

  private async processAppointmentPayment(paymentRecord: Payment) {
    const user = this.request.req.user;
    const appointment = await Appointment.findOne({
      where: { id: paymentRecord.metadata.resourceId, user_id: user.id },
      relations: ['mentor', 'mentor.user'],
    });
    if (!appointment)
      throw new UnprocessableEntityException(
        'Payment confirmed. Appointment schedule not found',
      );
    appointment.status = AppointmentStatus.PENDING;
    await appointment.save();
    this.eventEmitter.emit(EVENTS.APPOINTMENT_PAYMENT_CONFIRMED, {
      appointment,
    });
    return { appointment };
  }
}
