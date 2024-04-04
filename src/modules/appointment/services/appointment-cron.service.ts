import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment.enum';

@Injectable()
export class AppointmentCronService {
  // constructor(
  //   @InjectRepository(Appointment)
  //   private appointmentRepository: Repository<Appointment>,
  // ) {}
  // @Cron(CronExpression.EVERY_SECOND)
  // async handleCron() {
  //   console.log(CronExpression.EVERY_SECOND);
  // }
  // Todo: implement a cron that runs every midnight:
  //* to check appointment that are awaiting funds - get appointment and payment record and send a payment link to the user's email
  //* to check appointment that are still pending, but date is past a day, then set as overdue and send reminder notification to mentor's email - update status to overdue, update reschedule count, update date to the following week
  //* to check appointment that has status accepted, but date is past a day, then set status to no-show and send reminder notification to mentor's email, update reschedule count, update date to the following week
}
