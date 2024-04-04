import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES } from 'src/common/queues.constants';
import { Appointment } from '../entities/appointment.entity';
import { NotificationService } from 'src/modules/notification/notification.service';
import { AppointmentStatus } from '../enums/appointment.enum';

@Processor(QUEUES.APPOINTMENTS)
export class AppointmentQueueProcessor {
  constructor(private readonly notificationService: NotificationService) {}
  @Process('send_reminder')
  async sendAppointmentReminder(job: Job<Appointment>) {
    try {
      const appointment = job.data;
      await Appointment.update(
        { id: appointment.id },
        { status: AppointmentStatus.UPCOMING },
      );
      console.log('Sending apppointment notification...', {
        appointment: appointment.id,
      });
      const title = 'Upcoming Mentorship Session';
      const userMessage = `Your requested mentorship session with ${appointment.mentor.user.name} will commence in few minutes. A link will be sent to your email when it's time.`; // Todo: content
      const mentorMessage = `Your mentorship session with user (${appointment.user.name}) will commence in few minutes. A link will be sent to your email when it's time`; //Todo: content
      this.notificationService.create(appointment.user, {
        body: userMessage,
        title,
        sendEmail: true,
      });
      this.notificationService.create(appointment.mentor.user, {
        body: mentorMessage,
        title,
        sendEmail: true,
      });
    } catch (error) {
      console.log('Job failed: ', { reason: job.failedReason, error });
    }
  }
}
