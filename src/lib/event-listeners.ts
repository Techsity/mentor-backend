import { Global, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { NotificationResourceType } from 'src/modules/notification/enums';
import { NotificationService } from 'src/modules/notification/notification.service';
import { INewCourseNotification } from 'src/modules/notification/types';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { PaymentStatus } from 'src/modules/payment/enum';
import { Subscription } from 'src/modules/subscription/entities/subscription.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { WalletService } from 'src/modules/wallet/wallet.service';

@Global()
export class EventEmitterListeners {
  private readonly logger = new Logger(EventEmitterListeners.name);
  constructor(
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
  ) {}

  @OnEvent(EVENTS.NEW_COURSE)
  sendNewCourseNotification({
    followers,
    course,
    mentorUser,
  }: INewCourseNotification) {
    try {
      for (const user of followers) {
        // check if user.allow_push_notifications
        if (user.allow_push_notifications) {
          this.notificationService.create(user, {
            title: 'New Course Published',
            body: `A mentor you follow (${mentorUser.name}) has published a new course. Check it out!`,
            resourceId: course.id,
            resourceType: NotificationResourceType.COURSES,
          });
        }
      }
    } catch (error) {
      const err = new Error(error);
      this.logger.error(
        'Error sending new course notification to mentor followers: ' +
          err.message,
        err.stack,
      );
    }
  }

  @OnEvent(EVENTS.PAID_COURSE_SUB_SUCCESSFUL)
  async processPaidCourseSubscription({
    paymentRecord: payment,
    subscription,
  }: {
    paymentRecord: Payment;
    subscription: Subscription;
  }) {
    try {
      // update payment status
      payment.status = PaymentStatus.SUCCESS;
      await Payment.update(payment.id, payment);
      const mentor = subscription.course.mentor || subscription.workshop.mentor;
      const resource = subscription.course || subscription.workshop;
      // notify mentor of the subscription
      this.notificationService.create(mentor.user, {
        body: `User ( ${
          subscription.user.name
        }) subscribed to your paid ${payment.metadata.resourceType.toLowerCase()} -  ${
          resource.title
        }`,
        title: `${
          payment.metadata.resourceType.charAt(0).toUpperCase() +
          payment.metadata.resourceType.slice(1).toLowerCase()
        } subscription`,
      });
      // fund mentor wallet
      this.walletService.creditWallet(mentor.id, payment.amount);
    } catch (error) {
      const err = new Error(error);
      this.logger.error(
        'Error processing paid course subscription: ' + err.message,
        err.stack,
      );
    }
  }

  @OnEvent(EVENTS.CANCEL_EXISTING_PAYMENT)
  async cancelPendingPayment({
    metadata,
    user,
  }: {
    metadata: Payment['metadata'];
    user: User;
  }) {
    try {
      const payments = await Payment.find({
        where: { metadata, user_id: user.id },
      });
      for (const paymentRecord of payments) {
        if (paymentRecord && paymentRecord.status !== PaymentStatus.SUCCESS) {
          paymentRecord.status = PaymentStatus.CANCELLED;
          await paymentRecord.save();
        }
      }
    } catch (error) {
      console.log({ error });
      const stack = new Error();
      this.logger.error('Error procssing payment cancellation', stack);
    }
  }

  @OnEvent(EVENTS.APPOINTMENT_PAYMENT_CONFIRMED)
  async appointmentPaymentConfirmed({
    appointment,
  }: {
    appointment: Appointment;
  }) {
    console.log('appointment payment confirmed: ', { appointment });
    // Todo: Fire notification to user
    // Todo: find payment with the appointment id and send amount to mentor's wallet ledger_balance
    // Todo: or send amount after session ends
  }

  @OnEvent(EVENTS.MENTOR_ACCEPT_APPOINTMENT)
  async processAppointment({ appointment }: { appointment: Appointment }) {
    console.log('mentor accepts event: ', { appointment });
    // Todo: Fire notification to user
    // Todo: or send amount after session ends
  }
}
