import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment.enum';
import { CreateAppointmentInput } from '../dto/create-appointment.input';
import { isEnum, isUUID } from 'class-validator';

@Injectable()
export class AppointmentService {
  constructor(
    @Inject(REQUEST) private readonly request: { req: { user: User } },
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
  ) {}

  private validateAppointmentInput(input: CreateAppointmentInput) {
    let { date, time } = input;
    const currentDate = new Date();
    if (!date.toString().includes('T')) {
      if (time.includes(':')) {
        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);
        let parsedHours = hours + 1;

        if (hours === 12) parsedHours = parsedHours - 12;
        else if (time.slice(-2).toUpperCase() === 'PM') parsedHours += 12;
        date.setHours(parsedHours, minutes, 0);
        console.log({ date, currentDate, hours, minutes, parsedHours });
      } else {
        date.setTime(parseInt(time));
      }
    }
    console.log({ date });
    // console.log({ currentDate, date });
    // if (date < currentDate)
    //   throw new BadRequestException('Cannot schedule appointment in the past');
    return date;
  }

  private async checkAvailability(
    date: CreateAppointmentInput['date'],
    availability: Mentor['availability'],
  ) {
    // const dayIndex=
    // const day= daysOfTheWeek
    // const schedule = availability.map((d) => {});
    // return schedule;
    // availability.forEach(({ timeSlots }) =>
    //   timeSlots.forEach((element) => {
    //     element.isOpen;
    //   }),
    // );
  }

  /**
   *
   * @param createAppInput
   * @param mentor
   * TODO: Send email to both users, integrate payment
   */
  async createAppointment(
    createAppInput: CreateAppointmentInput,
    mentor: string,
  ) {
    if (!mentor || !isUUID(mentor))
      throw new BadRequestException('Invalid mentor Id');
    const date = this.validateAppointmentInput(createAppInput);
    const mentorProfile = await this.mentorRepository.findOne({
      where: { id: mentor },
      relations: ['user'],
    });
    if (!mentorProfile) throw new NotFoundException('Mentor not found');
    this.checkAvailability(date, mentorProfile.availability);

    try {
      const authUser = this.request.req.user;

      // Check if user is a premium user
      if (!authUser.isPremium && mentorProfile.user.isPremium)
        throw new ForbiddenException(
          'You are not allowed to schedule appointments with a premium mentor',
        );

      const currentAppointment = await this.appointmentRepository.findOne({
        where: {
          user: { id: authUser.id },
          mentor: { id: mentorProfile.id },
          status: AppointmentStatus.PENDING || AppointmentStatus.ACCEPTED,
        },
      });
      // Check if user has a pending appointment
      if (currentAppointment)
        throw new BadRequestException(
          'You already have an appointment with this mentor',
        );
      // await Mentor.update({})
      return this.appointmentRepository.save({
        date: new Date(date),
        mentor: mentorProfile,
        user: authUser,
      });
    } catch (error) {
      throw error;
    }
  }

  async viewAllAppointments(statuses?: AppointmentStatus[]): Promise<any> {
    try {
      if (statuses && statuses.length > 0)
        for (const [status, index] of statuses)
          if (!isEnum(status, AppointmentStatus))
            throw new BadRequestException(`Invalid status at index ${index}`);

      const authUser = this.request.req.user;
      const query = this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.user.id = :userId', { userId: authUser.id })
        .leftJoinAndSelect('appointment.mentor', 'mentor');
      // .leftJoinAndSelect('appointment.user', 'user');

      if (statuses && statuses.length > 0)
        query.andWhere('appointment.status IN (:...statuses)', { statuses });

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
      const authUser = this.request.req.user;
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
    const authUser = this.request.req.user;

    try {
      if (!isUUID(appointmentId))
        throw new BadRequestException('Invalid appointmentId');
      return await this.appointmentRepository.findOne({
        where: { id: appointmentId, user_id: authUser.id },
        relations: ['mentor', 'user'],
      });
    } catch (error) {
      throw error;
    }
  }
}
