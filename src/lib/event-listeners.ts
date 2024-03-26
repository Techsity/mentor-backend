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
import { SubscriptionType } from 'src/modules/subscription/enums/subscription.enum';
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
      // Todo: use notification queue
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
    const payment = await Payment.findOne({
      where: {
        metadata: {
          resourceId: appointment.id,
          resourceType: SubscriptionType.MENTORSHIP_APPOINTMENT,
        },
        user_id: appointment.user_id,
      },
    });
    if (!payment) {
      this.logger.log(
        `Payment record associated with the appointment ${appointment.id} not found. Can't send funds appointment fees to mentor`,
      );
      return;
    }
    // Notify user
    if (payment.status === PaymentStatus.SUCCESS) {
      this.walletService.topupLedgerBalance(
        appointment.mentor_id,
        payment.amount,
      );
      this.notificationService.create(appointment.user, {
        title: 'Payment Confirmed',
        body: `Your payment for the mentorship session with ${appointment.mentor.user.name} has been confirmed.`,
      });
      this.notificationService.create(appointment.mentor.user, {
        title: 'Mentorship Session Payment',
        body: `A sum of ${Number(
          payment.amount.toFixed(),
        ).toLocaleString()} for a mentorship session with ${
          appointment.user.name
        } has been confirmed and paid into your ledge balance.`,
      });
    }
  }

  @OnEvent(EVENTS.MENTOR_ACCEPT_APPOINTMENT)
  processAppointment({ appointment }: { appointment: Appointment }) {
    this.notificationService.create(appointment.user, {
      title: 'Mentorship Request Accepted',
      body: `Mentor (${appointment.mentor.user.name}) has accepted your mentorship session request! 
      You will be notified before the session starts.`,
    });
  }
}
