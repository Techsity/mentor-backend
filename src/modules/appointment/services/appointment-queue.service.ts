import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Appointment } from '../entities/appointment.entity';
import { OnEvent } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';

@Injectable()
export class AppointmentQueueService {
  constructor(
    @InjectQueue('appointments') private readonly appointmentQueue: Queue,
  ) {}
  @OnEvent(EVENTS.MENTOR_ACCEPT_APPOINTMENT)
  async scheduleNotification({ appointment }: { appointment: Appointment }) {
    console.log('scheduling appointment event notification: ', { appointment });
    const { date } = appointment;
    const delay = date.getTime() - Date.now() - 20 * 60 * 1000; //20mins before due date
    console.log('New appointment notification added to the queue');
    await this.appointmentQueue.add(appointment.id, appointment, { delay });
  }
}
