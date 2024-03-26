import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment.enum';
import { CreateAppointmentInput } from '../dto/create-appointment.input';
import { isEnum, isUUID } from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { PaymentStatus } from 'src/modules/payment/enum';

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
    private readonly eventEmitter: EventEmitter2,
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
   * @param input
   * @param mentor
   * TODO: Send email to both users, integrate payment
   */

  async createAppointment(input: CreateAppointmentInput, mentor: string) {
    const authUser = this.request.req.user;

    if (!mentor || !isUUID(mentor))
      throw new BadRequestException('Invalid mentor Id');
    const date = this.validateAppointmentInput(input);
    // // Confirm if payment has been made
    // const paymentRecord = await Payment.findOne({
    //   where: {
    //     user_id: authUser.id,
    //     reference: input.paymentReference,
    //     status: PaymentStatus.SUCCESS,
    //   },
    // });
    // if (!paymentRecord)
    //   throw new BadRequestException(
    //     'No payment record found for this appointment',
    //   );
    const mentorProfile = await this.mentorRepository.findOne({
      where: { id: mentor },
      relations: ['user'],
    });
    if (!mentorProfile) throw new NotFoundException('Mentor not found');
    this.checkAvailability(date, mentorProfile.availability);

    try {
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

      const appointment = await this.appointmentRepository.save({
        date: new Date(date),
        mentor: mentorProfile,
        user: authUser,
      });
      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async viewAllAppointments(statuses?: AppointmentStatus[]): Promise<any> {
    try {
      const authUser = this.request.req.user;

      if (statuses && statuses.length > 0)
        for (const [status, index] of statuses)
          if (!isEnum(status, AppointmentStatus))
            throw new BadRequestException(`Invalid status at index ${index}`);

      const query = this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.user.id = :userId', { userId: authUser.id })
        .leftJoinAndSelect('appointment.mentor', 'mentor')
        .leftJoinAndSelect('appointment.mentor.user', 'mentor.user');
      // .leftJoinAndSelect('appointment.user', 'user');

      if (statuses && statuses.length > 0)
        query.andWhere('appointment.status IN (:...statuses)', { statuses });
      // Todo: don't include status = AppointmentStatus.AWAITING_PAYMENT

      return query.getMany();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param mentorId
   * @param appointmentId
   * @param status
   * @returns
   */

  async toggleAppointmentStatus(
    mentorId: string,
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<any> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: {
          id: appointmentId,
          mentor_id: mentorId,
          status: Not(AppointmentStatus.AWAITING_PAYMENT),
        },
        relations: ['mentor', 'mentor.user'],
      });
      if (!appointment) throw new BadRequestException('Appointment not found');
      appointment.status = status;
      await appointment.save();
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
      const appointment = await this.appointmentRepository.findOne({
        where: {
          id: appointmentId,
          user_id: authUser.id,
          status: Not(AppointmentStatus.AWAITING_PAYMENT),
        },
        relations: ['mentor', 'mentor.user'],
      });
      if (!appointment) throw new BadRequestException('Appointment not found');

      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async acceptAppointment(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid appointment Id');
    const authUser = this.request.req.user;
    const mentorProfile = await this.mentorRepository.findOne({
      where: { user: { id: authUser.id } },
      relations: ['user'],
    });
    if (!mentorProfile)
      throw new BadRequestException('mentorProfile not found');
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id,
        mentor_id: mentorProfile.id,
        status: Not(AppointmentStatus.AWAITING_PAYMENT),
      },
    });
    if (!appointment) throw new BadRequestException('Appointment not found');

    if (appointment.status === AppointmentStatus.PENDING) {
      this.eventEmitter.emit(EVENTS.MENTOR_ACCEPT_APPOINTMENT, { appointment });
      appointment.status = AppointmentStatus.ACCEPTED;
      await appointment.save();
      return appointment;
    }
    return appointment;
  }

  // async rescheduleAppointment() {}
  // async rejectAppointment() {}
}
