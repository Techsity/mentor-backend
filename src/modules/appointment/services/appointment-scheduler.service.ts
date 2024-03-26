import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment.enum';

@Injectable()
export class AppointmentSchedulerService {
  // constructor(
  //   @InjectRepository(Appointment)
  //   private appointmentRepository: Repository<Appointment>,
  // ) {}
  // Todo: implement a cron that runs every 20mins to check if an appointment date would be due in 20mins or less, then fire notifications to participants (user and mentor)
  // // run every hour
  // @Cron(CronExpression.EVERY_HOUR)
  // async handleCron() {
  //   const oneHourAgo = new Date();
  //   oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  //   // Update pending appointments whose date has exceeded 1 hour from now
  //   await this.appointmentRepository.update(
  //     {
  //       status: AppointmentStatus.PENDING,
  //       date: LessThan(oneHourAgo),
  //     },
  //     {
  //       date: () => `DATE_ADD(date, INTERVAL 7 DAY)`, // Adjust for your database dialect
  //     },
  //   );
  // }
  // //   async handleCron() {
  // //     // Get pending appointments
  // // await Appointment.update({status:AppointmentStatus.PENDING},{})
  // //     const pendingAppointments = await this.appointmentRepository.find({
  // //       where: {
  // //         status: AppointmentStatus.PENDING,
  // //       },
  // //       //  get the users to send notifications to
  // //       relations: ['user', 'mentor.user'],
  // //     });
  // //     // Loop through pending appointments and update as needed
  // //     for (const appointment of pendingAppointments) {
  // //       const now = new Date();
  // //       const appointmentDate = new Date(appointment.date);
  // //       // Check if the appointment date has exceeded 1 hour from now
  // //       if (now.getTime() - appointmentDate.getTime() >= 3600000) {
  // //         // Shift the appointment to the following week
  // //         appointment.date.setDate(appointment.date.getDate() + 7);
  // //         appointment.extension_count = appointment.extension_count + 1;
  // //         console.log(`Appointment ${appointment.id} status updated`);
  // //         // Todo: send notification to user and mentor indicating the update
  // //         await this.appointmentRepository.save(appointment);
  // //       }
  // //     }
  // //   }
}
