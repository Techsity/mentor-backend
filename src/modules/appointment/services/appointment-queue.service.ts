import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { Appointment } from '../entities/appointment.entity';
import { QUEUES } from 'src/common/queues.constants';
import { randomUUID } from 'crypto';

@Injectable()
export class AppointmentQueueService {
  constructor(
    @InjectQueue(QUEUES.APPOINTMENTS) private readonly appointmentQueue: Queue,
  ) {}
  async scheduleNotification({ appointment }: { appointment: Appointment }) {
    try {
      console.log('scheduling appointment event notification:: ', {
        appointment: appointment.status,
      });
      const { date } = appointment;
      // const delay = date.getTime() - Date.now() - 20 * 60 * 1000; //20mins before due date
      const delay = 5 * 1000;
      const jobOpts: Bull.JobOptions = {
        removeOnComplete: true,
        jobId: randomUUID(),
        priority: 1,
        delay,
        attempts: 3,
      };
      // const job = await this.appointmentQueue.add(
      //   'send_reminder',
      //   appointment,
      //   jobOpts,
      // );
      // console.log('New appointment notification added to the queue', { job });
    } catch (error) {
      console.log(
        `Error scheduling appointment notification. appointment (${appointment.id})`,
        { error },
      );
    }
  }
}
