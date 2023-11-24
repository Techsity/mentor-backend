import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '../../../../common/mailer/mailer.service';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';
import { AppointmentDTO } from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    private mailService: MailerService,
  ) {}

  /**
   *
   * @param createAppInput
   * @param mentor
   * TODO: Send email to both users, integrate payment
   */
  async createAppointment(createAppInput: any, mentor: string): Promise<any> {
    try {
      const authUser = this.request.req.user.user;
      const mentorProfile = await this.mentorRepository.findOne({
        where: { id: mentor },
        relations: ['user'],
      });
      const currentAppointment = await this.appointmentRepository.findOne({
        where: {
          user: { id: authUser.id },
          mentor: { id: mentorProfile.id },
          status: AppointmentStatus.PENDING || AppointmentStatus.ACCEPTED,
        },
      });
      // Check if user has a pending appointment
      if (currentAppointment)
        throw Error('You already have an appointment with this mentor');

      // Check if user is a premium user
      if (!authUser.isPremium && mentorProfile.user.isPremium) {
        throw Error(
          'You are not allowed to schedule appointments with a premium mentor',
        );
      }

      return this.appointmentRepository.save({
        ...createAppInput,
        mentor: mentorProfile,
        user: authUser,
      });
    } catch (error) {
      throw error;
    }
  }

  async viewAppointments(statuses?: string[]): Promise<any> {
    try {
      const authUser = this.request.req.user.user;
      const query = this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.user.id = :userId', { userId: authUser.id })
        .leftJoinAndSelect('appointment.mentor', 'mentor');
      // .leftJoinAndSelect('appointment.user', 'user');

      if (statuses && statuses.length > 0) {
        query.andWhere('appointment.status IN (:...statuses)', { statuses });
      }
      return query.getMany();
    } catch (error) {
      throw error;
    }
  }
  async toggleAppointmentStatus(
    mentorId: string,
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<any> {
    try {
      const authUser = this.request.req.user.user;
      await this.appointmentRepository.update(
        { id: appointmentId, mentor: { id: mentorId } },
        {
          status,
        },
      );
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['mentor', 'user'],
      });
      await this.mailService.sendMail('Test Email', 'Test Email here');
      // if(status === AppointmentStatus.DECLINED) {
      // Send Email Notification to both mentor and user
      //  return { message: 'Appointment Declined!' };
      // }
      // else if(status === AppointmentStatus.CANCELED) {
      //  Send Email Notification to both mentor and user
      //  Add to Google Calendar
      //  return { message: 'Appointment Canceled!' };
      // }
      // Send Email Notification to both mentor and user
      // Create cron job for recurring notifications
      // Add to Google Calendar
      return appointment;
    } catch (error) {
      throw error;
    }
  }
  async viewAppointment(appointmentId: string): Promise<any> {
    try {
      return await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['mentor', 'user'],
      });
    } catch (error) {
      throw error;
    }
  }
}
