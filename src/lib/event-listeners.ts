import { Global, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { AppointmentRefundRequest } from 'src/modules/appointment/entities/appointment-refund-request.entity';
import { Appointment } from 'src/modules/appointment/entities/appointment.entity';
import { AppointmentStatus } from 'src/modules/appointment/enums/appointment.enum';
import { AppointmentQueueService } from 'src/modules/appointment/services/appointment-queue.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import { FollowersNotificationInterface } from 'src/modules/notification/types';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { PaymentStatus } from 'src/modules/payment/enum';
import { User } from 'src/modules/user/entities/user.entity';
import { WalletService } from 'src/modules/wallet/wallet.service';

@Global()
export class EventEmitterListeners {
  private readonly logger = new Logger(EventEmitterListeners.name);
  constructor(
    private readonly notificationService: NotificationService,
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

  @OnEvent(EVENTS.NOTIFY_MENTOR_SUBSCRIPTION_PAYMENT)
  async processPaidSubscription({
    reference,
    user,
  }: {
    reference: string;
    user: User;
  }) {
    try {
      const paymentRecord = await Payment.findOne({ where: { reference } });
      // console.log('event:', { paymentRecord, user });
      let exisitingSub;
      exisitingSub = user.subscriptions.find(
        (sub) =>
          sub.course_id === paymentRecord.resourceId ||
          sub.workshop_id === paymentRecord.resourceId,
      );
      if (!exisitingSub)
        exisitingSub = user.appointments.find(
          (sub) => sub.id === paymentRecord.resourceId,
        );
      if (!exisitingSub) {
      }
      console.log({ exisitingSub });

      // const mentor = subscription.course.mentor || subscription.workshop.mentor;
      // const resource = subscription.course || subscription.workshop;
      // // notify mentor of the subscription
      // this.notificationService.create(mentor.user, {
      //   body: `User ( ${
      //     subscription.user.name
      //   }) subscribed to your paid ${payment.metadata.resourceType.toLowerCase()} -  ${
      //     resource.title
      //   }`,
      //   title: `${
      //     payment.metadata.resourceType.charAt(0).toUpperCase() +
      //     payment.metadata.resourceType.slice(1).toLowerCase()
      //   } subscription`,
      // });
      // // fund mentor wallet
      // this.walletService.creditWallet(mentor.id, payment.amount);
    } catch (error) {
      const err = new Error(error);
      this.logger.error(
        'Error processing paid subscription: ' + err.message,
        err.stack,
      );
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
    // // Update status
    appointmentRecord.status = AppointmentStatus.ACCEPTED;

    // // Todo: check if the appointment date has expired, then postpone to the following week and send notifications to user
    // const currentDate = new Date();
    // const appointmentDate = new Date(appointmentRecord.date);
    // const isOverdue = currentDate.getTime() > appointmentDate.getTime();

    // if (isOverdue || appointment.status == AppointmentStatus.OVERDUE) {
    //   const nextWeek = new Date(appointmentDate);
    //   nextWeek.setDate(nextWeek.getDate() + 7);
    //   appointmentRecord.date = nextWeek;
    //   appointmentRecord.reschedule_count =
    //     appointmentRecord.reschedule_count + 1;
    // }
    await appointmentRecord.save();
    // Schedule notification and send notification to user
    this.appointmentQueueService.scheduleNotification({
      appointment: appointmentRecord,
    });
    this.notificationService.create(appointmentRecord.user, {
      title: 'Mentorship Request Accepted',
      body: `${
        appointment.mentor.user.name
      } has accepted your mentorship session request! Session is scheduled for ${appointmentRecord.date.toString()} by ${appointmentRecord.date.toTimeString()}. You will be notified before the session starts.`,
      sendEmail: true,
    });
  }

  @OnEvent(EVENTS.APPOINTMENT_RESCHEDULE)
  async sendRescheduleNotification({
    appointment,
  }: {
    appointment: Appointment;
  }) {
    // re-schedule notification cron

    const msg = `Session is now scheduled for ${appointment.date.toString()} by ${appointment.date.toTimeString()}. You will be notified before the session starts.`;
    this.notificationService.create(appointment.user, {
      title: 'Mentorship Session Rescheduled',
      body:
        appointment.status === AppointmentStatus.RESCHEDULED_BY_MENTOR
          ? `${appointment.mentor.user.name} rescheduled a session with you.` +
            msg
          : AppointmentStatus.RESCHEDULED_BY_USER &&
            `You have successfully rescheduled your session with ${appointment.mentor.user.name}. ` +
              msg,
      sendEmail: true,
    });

    this.notificationService.create(appointment.mentor.user, {
      title: 'Mentorship Session Rescheduled',
      body:
        appointment.status === AppointmentStatus.RESCHEDULED_BY_USER
          ? `${appointment.user.name} rescheduled a session with you.` + msg
          : AppointmentStatus.RESCHEDULED_BY_MENTOR &&
            `You have successfully rescheduled your session with ${appointment.user.name}. ` +
              msg,
      sendEmail: true,
    });
    await this.appointmentQueueService.rescheduleNotification({
      appointment,
    });
  }

  @OnEvent(EVENTS.CANCEL_APPOINTMENT)
  async cancelAppointment({
    appointment,
    reason,
  }: {
    appointment: Appointment;
    reason: string;
  }) {
    try {
      await AppointmentRefundRequest.save({
        appointment,
        paymentReference: appointment.paymentReference,
        reason,
        requestedAt: new Date(),
        userId: appointment.user.id,
      });

      let cancelledBy = appointment.status
        .split('_')
        .join(' ')
        .toLowerCase() as CancelledBy;
      cancelledBy = cancelledBy.split('cancelled by ')[1] as CancelledBy;
      const title = 'Mentorship Session Cancelled';
      let msg;
      if (cancelledBy === 'user') {
        msg = `Your appointment with ${
          appointment.user.name
        } scheduled for ${appointment.date.toString()} has been cancelled by ${
          appointment.user.name
        }.`;
        this.notificationService.create(appointment.mentor.user, {
          title,
          body: msg,
          sendEmail: true,
        });
        msg = `You have cancelled your appointment with ${
          appointment.mentor.user.name
        } scheduled for ${appointment.date.toString()}. If your payment was successful, it will be refunded within 5-business days.`;
        this.notificationService.create(appointment.user, {
          title,
          body: msg,
          sendEmail: true,
        });
      } else if (cancelledBy === 'mentor') {
        msg = `Your appointment with ${
          appointment.mentor.user.name
        } scheduled for ${appointment.date.toString()} has been cancelled by ${
          appointment.mentor.user.name
        }. If your payment was successful, it will be refunded within 5-business days.`;
        this.notificationService.create(appointment.user, {
          title,
          body: msg,
          sendEmail: true,
        });
        msg = `You have cancelled your appointment with ${
          appointment.user.name
        } scheduled for ${appointment.date.toString()}.`;
        this.notificationService.create(appointment.mentor.user, {
          title,
          body: msg,
          sendEmail: true,
        });
      }
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
    }
  }
}

type CancelledBy = 'user' | 'mentor';
