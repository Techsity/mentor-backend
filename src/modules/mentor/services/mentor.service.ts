import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  CreateMentorInput,
  UserAvailabilityInput,
} from '../dto/create-mentor.input';
import { UpdateMentorInput } from '../dto/update-mentor.input';
import { Mentor } from '../entities/mentor.entity';
import { CustomStatusCodes, daysOfTheWeek } from 'src/common/constants';
import { isUUID } from 'class-validator';
import { MentorDTO } from '../dto/mentor.dto';
import { UserAvailability } from '../types/mentor.type';
import { randomUUID } from 'crypto';

@Injectable({ scope: Scope.REQUEST })
export class MentorService {
  private logger = new Logger(MentorService.name);
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    private readonly _entityManager: EntityManager,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private parseTime(time: string) {
    // const match = time.match(/(\d+):(\d+)(am|pm)/i);
    const match = time.match(/(\d+):(\d+)/i);
    if (match) {
      let hour: any = parseInt(match[1]);
      let minute: any = parseInt(match[2]);
      let meridan: 'am' | 'pm' = hour >= 12 ? 'pm' : 'am';
      if (hour >= 12) {
        if (hour === 12) hour = 12;
        else hour = hour % 12;
        meridan = 'pm';
      } else if (hour < 12) {
        if (hour === 0) hour = 12;
        meridan = 'am';
      }
      hour = String(hour).padStart(2, '0');
      minute = String(minute).padStart(2, '0');
      return hour.concat(':').concat(minute).concat(meridan);
    }
    return null;
  }

  private calculateDuration(startTime: Date, endTime: Date): number {
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  }

  private validateAvailabilityInput(input: UserAvailabilityInput[]) {
    input.forEach((date: UserAvailability) => {
      if (
        !daysOfTheWeek.some(
          (day) => day.toLowerCase() == date.day.toLowerCase(),
        )
      )
        throw new BadRequestException(
          'Invalid availability day | Expected a value of day of the week (sunday - saturday)',
        );
      // Validate time format and duration
      date.timeSlots.forEach((timeSlot) => {
        const startTime = this.parseTime(timeSlot.startTime);
        const endTime = this.parseTime(timeSlot.endTime);
        if (!startTime || !endTime)
          throw new BadRequestException('Invalid time format');
        timeSlot.startTime = startTime;
        timeSlot.endTime = endTime;
      });

      date.id = randomUUID();
    });
    return input as unknown as UserAvailability[];
  }

  async createMentorProfile(createMentorInput: CreateMentorInput) {
    const availability = this.validateAvailabilityInput(
      createMentorInput.availability,
    );
    try {
      const user = this.request.req.user;
      let mentorProfile = await this.mentorRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (mentorProfile) return mentorProfile;

      mentorProfile = this.mentorRepository.create({
        ...createMentorInput,
        user,
      });
      mentorProfile.availability = [
        ...availability.map((day) => {
          return {
            ...day,
            timeSlots: day.timeSlots.map((time) => {
              return { ...time, isOpen: true };
            }),
          };
        }),
      ];
      await this.mentorRepository.save(mentorProfile);
      return mentorProfile;
    } catch (error) {
      // console.log({ error: JSON.stringify(error) });
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      if (error?.code == String(CustomStatusCodes.DUPLICATE_RESOURCE))
        throw new BadRequestException(
          'Mentor profile already exists for this user',
        );
      throw error;
    }
  }

  async updateMentorProfile(
    updateMentorInput: UpdateMentorInput,
  ): Promise<UpdateMentorInput> {
    const user = this.request.req.user;
    let { availability } = updateMentorInput;
    let mentorProfile: Mentor = await this.mentorRepository.findOneBy({
      user: { id: user.id },
    });

    if (!mentorProfile) throw new NotFoundException('Mentor profile not found');

    try {
      return await this._entityManager.transaction(
        async (transactionalEntityManager) => {
          if (availability) {
            const validatedAvailability =
              this.validateAvailabilityInput(availability);

            validatedAvailability.forEach((day: UserAvailability) => {
              day.timeSlots.forEach((slot) => {
                // set all incoming slots to isOpen by default
                slot.isOpen = true;
                // Check for conflicting slots in the existing availability
                const conflictingSlot = mentorProfile.availability
                  .find((vDay) => vDay.day === day.day)
                  ?.timeSlots.find(
                    (vSlot) =>
                      vSlot.startTime === slot.startTime &&
                      vSlot.endTime === slot.endTime,
                  );
                if (conflictingSlot) {
                  if (!conflictingSlot.isOpen)
                    throw new BadRequestException(
                      `Conflict: ${day.day} has a scheduled appointment by ${conflictingSlot.startTime} - ${conflictingSlot.endTime}`,
                    );
                  // if it's not open, update time
                  conflictingSlot.startTime = slot.startTime;
                  conflictingSlot.endTime = slot.endTime;
                }
              });

              const existingDay = mentorProfile.availability.find(
                (d) => d.day === day.day,
              );

              if (existingDay) {
                // If the day already exists, iterate through each time slot in the day's timeSlots array
                day.timeSlots.forEach((newSlot) => {
                  // Check if the new time slot already exists in the existing day's timeSlots array
                  const existingSlotIndex = existingDay.timeSlots.findIndex(
                    (existingSlot) =>
                      existingSlot.startTime === newSlot.startTime &&
                      existingSlot.endTime === newSlot.endTime,
                  );

                  if (existingSlotIndex === -1)
                    existingDay.timeSlots.unshift(newSlot);
                  else existingDay.timeSlots[existingSlotIndex] = newSlot;
                });
              } else mentorProfile.availability.unshift(day);
            });
          }

          const updatedMentor = await transactionalEntityManager.save(Mentor, {
            ...mentorProfile,
          });
          return updatedMentor as unknown as UpdateMentorInput;
        },
      );
    } catch (error) {
      const stack = new Error().stack;
      console.log({ error, stack });
      throw error;
    }
  }

  async getMentorProfile() {
    try {
      const user = this.request.req.user;
      const mentorProfile = await this.mentorRepository.findOne({
        where: { user: { id: user.id } },
        relations: [
          'user',
          'courses',
          'reviews',
          'appointments',
          'appointments.user',
        ],
      });
      if (!mentorProfile)
        throw new NotFoundException(`No Mentor Profile found!`);
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async viewMentor(id: string) {
    try {
      if (!isUUID(id)) throw new BadRequestException('Invalid mentor Id');
      const mentorProfile = await this.mentorRepository.findOne({
        where: { id },
        relations: [
          'user',
          'courses',
          'reviews',
          'followers',
          'courses.category',
          'courses.mentor.user',
          'courses.mentor.courses',
          'courses.category.course_type',
        ],
      });
      if (!mentorProfile)
        throw new NotFoundException('Mentor profile not found');
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async viewAllMentors(): Promise<any[]> {
    try {
      return await this.mentorRepository.find({
        relations: ['user', 'reviews', 'followers'],
      });
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      throw error;
    }
  }
}
