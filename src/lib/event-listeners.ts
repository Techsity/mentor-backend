import { Global, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { AppointmentStatus } from 'src/modules/appointment/enums/appointment.enum';
import { AppointmentQueueService } from 'src/modules/appointment/services/appointment-queue.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import { FollowersNotificationInterface } from 'src/modules/notification/types';
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
    // Notfication queue
    private readonly walletService: WalletService,
    private readonly appointmentQueueService: AppointmentQueueService,
  ) {}

  @OnEvent(EVENTS.NOTIFY_FOLLOWERS)
  notifyFollowers({
    mentor,
    title,
    body,
    resource,
    resourceType,
  }: FollowersNotificationInterface) {
    try {
      const followers = mentor.followers;
      // Todo: use notification queue
      for (const user of followers) {
        if (user.allow_push_notifications) {
          this.notificationService.create(user, {
            title,
            body,
            resourceId: resource.id,
            resourceType,
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
    console.log('appointment payment confirmed: ', {
      appointment: appointment.id,
    });
    const payment = await Payment.findOne({
      where: {
        reference: appointment.paymentReference,
      },
    });
    if (!payment) {
      this.logger.log(
        `Payment record associated with appointment (${appointment.id}) not found. Can't send appointment fees to mentor`,
      );
      return;
    }
    // Notify user
    if (payment.status === PaymentStatus.SUCCESS) {
      this.notificationService.create(appointment.user, {
        title: 'Payment Confirmed',
        body: `Your payment for the mentorship session with ${appointment.mentor.user.name} has been confirmed.`,
        sendEmail: true,
      });
    }
  }

  @OnEvent(EVENTS.MENTOR_ACCEPT_APPOINTMENT)
  async processAppointment({ appointment }: { appointment: Appointment }) {
    const appointmentRecord = await Appointment.findOne({
      where: { id: appointment.id },
      relations: ['user', 'mentor', 'mentor.user'],
    });
    // Update status
    appointmentRecord.status = AppointmentStatus.ACCEPTED;

    // Todo: check if the appointment date has expired, then postpone to the following week and send notifications to user
    const currentDate = new Date();
    const appointmentDate = new Date(appointmentRecord.date);
    const isOverdue = currentDate.getTime() > appointmentDate.getTime();

    if (isOverdue || appointment.status == AppointmentStatus.OVERDUE) {
      const nextWeek = new Date(appointmentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      appointmentRecord.date = nextWeek;
      appointmentRecord.reschedule_count =
        appointmentRecord.reschedule_count + 1;
    }
    await appointmentRecord.save();
    console.log(appointmentRecord.date.toDateString());
    // Schedule notification and send notification to user
    this.appointmentQueueService.scheduleNotification({
      appointment: appointmentRecord,
    });
    this.notificationService.create(appointmentRecord.user, {
      title: 'Mentorship Request Accepted',
      body: `${
        appointment.mentor.user.name
      } has accepted your mentorship session request! Session is scheduled for ${appointmentRecord.date.toDateString()} by ${appointmentRecord.date.toTimeString()}. You will be notified before the session starts.`,
      sendEmail: true,
    });
  }
}
