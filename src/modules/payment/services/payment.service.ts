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
import { User } from '../../user/entities/user.entity';
import { InitializePaymentResponse } from '../dto/initialize-payment-response.dto';
import { isEnum, isUUID } from 'class-validator';
import { SubscriptionType } from '../../subscription/enums/subscription.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import {
  PAYMENT_CHANNELS,
  PaymentStatus,
  TransactionStatus,
  TransactionType,
} from '../enum';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { Course } from '../../course/entities/course.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { CustomResponseMessage, CustomStatusCodes } from 'src/common/constants';
import { Subscription } from '../../subscription/entities/subscription.entity';
import PaystackProvider from 'src/providers/paystack/paystack.provider';
import Decimal from 'decimal.js';
import { ISOCurrency } from '../types/payment.type';
import { Appointment } from '../../appointment/entities/appointment.entity';
import VerifyPaymentDTO from '../dto/verify-payment.response.dto';
import { AppointmentStatus } from '../../appointment/enums/appointment.enum';
import { Transaction } from '../entities/transaction.entity';
import { InitializePaymentInput } from '../dto/initialize-payment-input.dto';

@Injectable()
export class PaymentService {
  private readonly logger: Logger = new Logger(PaymentService.name);

  constructor(
    @Inject(REQUEST)
    private readonly request: { req: { user: User } },
    private configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
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

  private async resourceValidation(
    resourceId: string,
    resourceType: SubscriptionType,
  ) {
    const user = this.request.req.user;
    // confirm if course or workshop exist
    let resource;
    if (resourceType !== SubscriptionType.MENTORSHIP_APPOINTMENT) {
      if (resourceType === SubscriptionType.COURSE) {
        resource = await this.courseRepository.findOneBy({ id: resourceId });
      } else if (resourceType === SubscriptionType.WORKSHOP) {
        resource = await this.workshopRepository.findOneBy({ id: resourceId });
      }
      if (!resource) throw new BadRequestException(`Unknown resource`);
    }
    //   if (
    //     user.subscriptions.some(
    //       (sub) =>
    //         sub.course_id === resourceId || sub.workshop_id === resourceId,
    //     )
    //   )
    //     throw new BadRequestException(
    //       `You have already subscribed to this ${resourceType.toLowerCase()}`,
    //     );
    // if (resourceType == SubscriptionType.MENTORSHIP_APPOINTMENT) {
    //   resource = await Appointment.findOne({
    //     where: {
    //       id: resourceId,
    //       user_id: user.id,
    //       status: In([
    //         AppointmentStatus.PENDING,
    //         AppointmentStatus.AWAITING_PAYMENT,
    //       ]),
    //     },
    //   });
    //   if (resource)
    //     throw new BadRequestException(
    //       `You already have an appointment with this mentor`,
    //     );
    // }
  }

  async initiatePayment(input: InitializePaymentInput) {
    const user = this.request.req.user;

    try {
      await this.resourceValidation(input.resourceId, input.resourceType);
      const isValidAcct = await this.paystackService.validateAccount(
        input.accountNumber,
        input.bankCode,
      );
      if (!isValidAcct.status)
        throw new BadRequestException('Invalid bank account details');

      // const rate = await this.paystackService.getExchangeRate(input.currency);
      // console.log({ rate });
      // console.log({ amount: input.amount, exchanged: input.amount * rate });
      const {
        data: { display_text, reference, status },
      } = await this.paystackService.chargeAccount({
        ...input,
        email: user.email,
      });
      const exisitingPayment = await this.paymentsRepository.findOne({
        where: {
          resourceId: input.resourceId,
          user_id: user.id,
          status: PaymentStatus.PENDING,
        },
      });
      if (exisitingPayment) {
        exisitingPayment.reference = reference;
        exisitingPayment.amount = input.amount;
        exisitingPayment.currency = input.currency;
        exisitingPayment.accountNumber = input.accountNumber;
        exisitingPayment.accountName = isValidAcct.data.account_name;
        exisitingPayment.bankCode = input.bankCode;
        exisitingPayment.chargeAttempt = exisitingPayment.chargeAttempt++;
        await exisitingPayment.save();
      } else {
        await this.paymentsRepository.save({
          user,
          currency: input.currency,
          channel: PAYMENT_CHANNELS.BANK,
          amount: input.amount,
          accountNumber: input.accountNumber,
          accountName: isValidAcct.data.account_name,
          bankCode: input.bankCode,
          reference,
          resourceId: input.resourceId,
          resourceType: input.resourceType,
        });
      }
      return { display_text, reference, status };
    } catch (error) {
      this.logger.error('An error occured while initiating transaction', error);
      if (error.response && error.response.data) {
        console.log({ error: error.response.data });
        // && error.response.status == 400
        throw new BadRequestException(
          error.response.data?.data
            ? error.response.data?.data.message
            : error.response.data.message,
        );
      }
      console.error({ error });
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async verifyTransaction(ref: string, otp: string): Promise<VerifyPaymentDTO> {
    const user = this.request.req.user;
    try {
      let {
        data: {
          amount,
          reference,
          display_text,
          status,
          gateway_response,
          authorization,
        },
        message,
      } = await this.paystackService.verifyChargeOTP(ref, otp);
      amount = amount ? amount / 100 : null;
      if (status == 'success') {
        await this.paymentsRepository.update(
          { reference },
          { status: PaymentStatus.SUCCESS, metadata: authorization },
        );
        this.eventEmitter.emit(EVENTS.NOTIFY_MENTOR_SUBSCRIPTION_PAYMENT, {
          reference,
          user,
        });
      }
      return {
        data: { amount, reference, status, gateway_response },
        reference,
        status,
        display_text: display_text || message,
      };
    } catch (error) {
      this.logger.error('An error occured while verifying transaction', error);
      console.log({ error: error.response.data });
      if (error.response)
        if (
          error.response.status == 400 &&
          error.response.data.message == 'Charge attempted' &&
          error.response.data.data
        )
          throw new BadRequestException(
            error.response.data.data.message.includes('Incorrect Token')
              ? 'Invalid OTP'
              : error.response.data.data.message,
          );
        else if (error.response.status == 400)
          throw new BadRequestException(error.response.data.message);
      throw new InternalServerErrorException('Something went wrong', error);
    }
  }

  async confirmPendingTransaction(input: {
    reference: string;
    resourceId: string;
    resourceType;
  }): Promise<Payment> {
    const user = this.request.req.user;
    const { reference, resourceType, resourceId } = input;
    if (!isUUID(resourceId))
      throw new BadRequestException('resourceId must be a valid uuid');
    if (!isEnum(resourceType, SubscriptionType))
      throw new BadRequestException(
        `Invalid resourceType | Expected either 'course' or 'workshop' or 'mentorship_appointment'`,
      );
    const paymentRecord = await this.paymentsRepository.findOne({
      where: { reference, resourceId, resourceType },
    });
    if (!paymentRecord) throw new UnprocessableEntityException();
    const isCompleted = await this.paystackService.confirmPendingCharge(
      paymentRecord.reference,
    );
    // console.log({ isCompleted });
    if (isCompleted.data.status !== 'success')
      throw new UnprocessableEntityException(
        'Payment has not been verified. Please contact support.',
      );
    if (isCompleted.data.status === 'success') {
      if (paymentRecord.status !== PaymentStatus.SUCCESS) {
        paymentRecord.status = PaymentStatus.SUCCESS;
        await paymentRecord.save();
      }
      this.eventEmitter.emit(EVENTS.NOTIFY_MENTOR_SUBSCRIPTION_PAYMENT, {
        reference: paymentRecord.reference,
        user,
      });
    }
    return paymentRecord;
  }

  async fetchBanks() {
    try {
      const data = await this.paystackService.fetchBanks();
      return data;
    } catch (error) {
      this.logger.error('Error fetching banks');
      throw error;
    }
  }

  private async processAppointmentPayment(paymentRecord: Payment) {
    const user = this.request.req.user;
    const appointment = await Appointment.findOne({
      where: { id: paymentRecord.metadata.resourceId, user_id: user.id },
      relations: ['mentor', 'mentor.user', 'user'],
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
//and sign  &&
