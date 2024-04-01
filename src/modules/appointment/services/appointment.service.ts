import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
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
import { UserAvailability } from 'src/modules/mentor/types/mentor.type';
import { daysOfTheWeek } from 'src/common/constants';

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

  private validateAppointmentDate(input: CreateAppointmentInput) {
    let { date, time } = input;
    const formattedDate = new Date(date);
    if (time.includes(':')) {
      const [hoursStr, minutesStr] = time.split(':', 2);
      let hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);
      if (hours === 12) hours = hours - 12;
      else if (time.slice(-2).toUpperCase() === 'PM') hours += 12;
      formattedDate.setHours(hours, minutes, 0);
    } else formattedDate.setTime(parseInt(time));
    return formattedDate;
  }

  private checkAvailability(date: Date, availability: UserAvailability[]) {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const mins = date.getMinutes();
    const { day, timeSlots, id } = availability.find((avail) => {
      return avail.day.toLowerCase() == daysOfTheWeek[dayOfWeek].toLowerCase();
    });
    if (!day)
      throw new BadRequestException(
        "Session not available on the mentor's availability schedule",
      );
    const { slot, slotIndex } = findEqualTimeSlot(timeSlots, hour, mins);
    if (!slot)
      throw new BadRequestException(
        "Session not available on mentor's availability schedule",
      );
    if (!slot.isOpen) throw new BadRequestException('Session is booked');
    return { id, day, slot, slotIndex };
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
    const date = this.validateAppointmentDate(input);
    const mentorProfile = await this.mentorRepository.findOne({
      where: { id: mentor },
      relations: ['user'],
    });
    if (!mentorProfile) throw new NotFoundException('Mentor not found');
    const { id, slotIndex } = this.checkAvailability(
      date,
      mentorProfile.availability,
    );

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
          status: Not(
            In([
              AppointmentStatus.DECLINED,
              AppointmentStatus.PENDING,
              AppointmentStatus.COMPLETED,
              AppointmentStatus.CANCELLED_BY_USER,
              AppointmentStatus.CANCELLED_BY_MENTOR,
            ]),
          ),
        },
      });

      // Check if user has a pending appointment
      if (currentAppointment)
        throw new BadRequestException(
          'You already have an appointment with this mentor',
        );
      const reference = 'ref_' + Date.now();
      mentorProfile.availability.forEach((d) => {
        if (d.id === id) d.timeSlots[slotIndex].isOpen = false;
      });
      await mentorProfile.save();
      const appointment = await this.appointmentRepository.save({
        date: new Date(date),
        mentor: mentorProfile,
        user: authUser,
        paymentReference: reference,
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

      return query.getMany();
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
        where: { id: appointmentId, user_id: authUser.id },
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
      relations: ['user', 'mentor', 'mentor.user'],
    });
    if (!appointment) throw new BadRequestException('Appointment not found');

    if (appointment.status === AppointmentStatus.PENDING)
      this.eventEmitter.emit(EVENTS.MENTOR_ACCEPT_APPOINTMENT, { appointment });
    return appointment;
  }

  async rescheduleAppointment(
    appointmentId: string,
    input: CreateAppointmentInput,
  ) {
    if (!appointmentId)
      throw new BadRequestException('appointmentId is required');
    if (!isUUID(appointmentId))
      throw new BadRequestException('Invalid appointmentId');
    const user = this.request.req.user;
    const date = this.validateAppointmentDate(input);
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['mentor', 'user', 'mentor.user'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    let mentorProfile = await this.mentorRepository.findOneBy({
      user: { id: user.id },
    });
    appointment.status = AppointmentStatus.RESCHEDULED_BY_MENTOR;
    if (!mentorProfile) {
      appointment.status = AppointmentStatus.RESCHEDULED_BY_USER;
      mentorProfile = await this.mentorRepository.findOneBy({
        id: appointment.mentor_id,
      });
    }
    if (!mentorProfile)
      throw new UnprocessableEntityException('Mentor profile not found');
    const previousAppointmentDate = new Date(appointment.date);

    const { id, slotIndex } = this.checkAvailability(
      date,
      mentorProfile.availability,
    );
    // update slots availability - isOpen
    mentorProfile.availability.forEach(({ id: slotId, timeSlots, day }) => {
      if (slotId === id) {
        timeSlots[slotIndex].isOpen = false;
        console.log({ day, slot: timeSlots[slotIndex] });
      }

      const { slot: prevSlot } = findEqualTimeSlot(
        timeSlots,
        previousAppointmentDate.getHours(),
        previousAppointmentDate.getMinutes(),
      );
      if (prevSlot) {
        prevSlot.isOpen = true;
        console.log({ prevSlot });
      }
    });
    await mentorProfile.save();
    appointment.date = date;
    appointment.reschedule_count = appointment.reschedule_count + 1;
    await appointment.save();
    // Todo: alert mentor and user of the update
    appointment.status === AppointmentStatus.RESCHEDULED_BY_USER
      ? (appointment.user = null)
      : appointment.status === AppointmentStatus.RESCHEDULED_BY_MENTOR
      ? (appointment.mentor = null)
      : {};
    return appointment;
  }

  async declineAppointment() {}

  async cancelAppointment() {
    // find appointment
    // confirm status and update status - CANCELLED_BY_USER || CANCELLED_BY_MENTOR (appointment.mentor.user.id === user.id)
    // create refund record
    // response
  }

  async updateNewSchedule(acceptNewSchedule: boolean) {
    // acceptNewSchedule
  }
}

function findEqualTimeSlot(
  timeSlots: UserAvailability['timeSlots'],
  hour: number,
  mins: number,
) {
  let slotIndex;
  const slot = timeSlots.find(({ startTime }, index) => {
    const [hoursStr, minutesStr] = startTime.split(':', 2);
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    if (hours > 12) hours = hours - 12;
    else if (startTime.slice(-2).toUpperCase() === 'PM') hours += 12;
    const equalSlot = hour === hours && mins === minutes;
    slotIndex = equalSlot ? index : null;
    return equalSlot;
  });
  return { slot, slotIndex };
}
