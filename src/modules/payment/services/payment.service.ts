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
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaymentStatus, TransactionStatus, TransactionType } from '../enum';
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
import VerifyPaymentDTO from '../dto/verify-payment.response';
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

  async initiatePayment(input: InitializePaymentInput) {
    try {
      const user = this.request.req.user;
      const {
        data: { display_text, reference, status },
      } = await this.paystackService.chargeAccount({
        ...input,
        email: user.email,
      });
      return { display_text, reference, status };
    } catch (error) {
      this.logger.error('An error occured while initiating transaction', error);
      if (error.response && error.response.data)
        // && error.response.status == 400
        throw new BadRequestException(error.response.data.message);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async verifyTransaction(ref: string, otp: string): Promise<VerifyPaymentDTO> {
    try {
      const res = await this.paystackService.verifyChargeOTP(ref, otp);
      return {
        data: res?.data,
        reference: res.data.reference,
        status: res.data.status,
        display_text: res.data.display_text,
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

  // async verifyPayment(reference: string): Promise<VerifyPaymentDTO> {
  //   const user = this.request.req.user;
  //   const paymentRecord = await this.paymentsRepository.findOne({
  //     where: { user_id: user.id, reference },
  //     relations: ['user'],
  //   });
  //   if (!paymentRecord)
  //     throw new NotFoundException(
  //       'We could not find the transaction. The reference you provided might be incorrect',
  //     );
  //   // check if payment has been processed
  //   if (paymentRecord.status === PaymentStatus.SUCCESS)
  //     throw new BadRequestException(
  //       'Transaction is already completed. Kindly wait for confirmation',
  //     );
  //   else if (paymentRecord.status === PaymentStatus.FAILED)
  //     throw new BadRequestException('Transaction failed. Contact support');
  //   else if (paymentRecord.status === PaymentStatus.REVERSED)
  //     throw new BadRequestException(
  //       'Transaction has been reversed. Contact support if you have any questions.',
  //     );

  //   try {
  //     const { status } = await this.paystackService.verifyTransaction(
  //       reference,
  //     );

  //     if (status === 'abandoned')
  //       throw new UnprocessableEntityException(
  //         CustomResponseMessage.getErrorMessage(
  //           CustomStatusCodes.ABANDONED_PAYMENT,
  //         ).concat(` | ${paymentRecord.access_code}`),
  //       );

  //     if (status !== 'success')
  //       throw new UnprocessableEntityException(
  //         'This request cannot be processed. The reference you provided might be incorrect',
  //       );

  //     if (
  //       paymentRecord.metadata.resourceType ===
  //       SubscriptionType.MENTORSHIP_APPOINTMENT
  //     ) {
  //       paymentRecord.status = PaymentStatus.SUCCESS;
  //       await paymentRecord.save();
  //       return await this.processAppointmentPayment(paymentRecord);
  //     } else {
  //       // subscribe to course or workshop
  //       let subscription;

  //       if (paymentRecord.metadata.resourceType === SubscriptionType.COURSE)
  //         subscription = await this.subscriptionService.subscribeToCourse(
  //           paymentRecord.metadata.resourceId,
  //         );
  //       else if (
  //         paymentRecord.metadata.resourceType === SubscriptionType.WORKSHOP
  //       )
  //         subscription = await this.subscriptionService.subscribeToWorkshop(
  //           paymentRecord.metadata.resourceId,
  //         );
  //       paymentRecord.status = PaymentStatus.SUCCESS;
  //       await Payment.update(paymentRecord.id, paymentRecord);

  //       this.eventEmitter.emit(EVENTS.PAID_COURSE_SUB_SUCCESSFUL, {
  //         paymentRecord,
  //         subscription,
  //       });
  //       // console.log({ res: response.data });
  //       // return 'Payment Verified';
  //       return { subscription };
  //     }
  //   } catch (error) {
  //     console.log({ error });
  //     // payment record won't be saved
  //     const errMsg = new Error('Payment verification error');
  //     this.logger.error(error, errMsg.stack);
  //     if (error.status === HttpStatus.UNPROCESSABLE_ENTITY) throw error;
  //     throw new InternalServerErrorException(errMsg.message);
  //   }
  // }

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
