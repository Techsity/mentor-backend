import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CreateMentorInput } from '../dto/create-mentor.input';
import { UpdateMentorInput } from '../dto/update-mentor.input';
import { Mentor } from '../entities/mentor.entity';
import { CustomStatusCodes, daysOfTheWeek } from 'src/common/constants';
import { isUUID } from 'class-validator';
import { MentorDTO } from '../dto/mentor.dto';

@Injectable({ scope: Scope.REQUEST })
export class MentorService {
  private logger = new Logger(MentorService.name);
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private validateCreateMentorInput(createMentorInput: CreateMentorInput) {
    const { availability } = createMentorInput;

    availability.forEach((date) => {
      if (
        !daysOfTheWeek.some(
          (day) => day.toLowerCase() == date.day.toLowerCase(),
        )
      )
        throw new BadRequestException(
          'Invalid availability day | Expected a value of day of the week (sunday - saturday)',
        );
      // todo: validate time format
    });
  }

  async createMentorProfile(createMentorInput: CreateMentorInput) {
    this.validateCreateMentorInput(createMentorInput);
    try {
      const user = this.request.req.user;
      const mentorProfile = this.mentorRepository.create({
        ...createMentorInput,
        user,
      });
      mentorProfile.availability.forEach((day) => {
        day.timeSlots.forEach((time) => {
          time.isOpen = true;
        });
      });
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
    try {
      const user = await this.findLoggedInUser();
      await this.mentorRepository.update(
        { user: { id: user.id } },
        updateMentorInput,
      );
      const mentorProfile =
        (await this.getMentorProfile()) as unknown as UpdateMentorInput;
      return mentorProfile;
    } catch (error) {
      throw error;
    }
  }

  async findLoggedInUser() {
    const authUser = this.request.req.user;
    const user = await this.userRepository.findOne({
      where: { id: authUser.user.id },
    });
    return user;
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
      // console.log({ user, mentorProfile });
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
