import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workshop } from '../entities/workshop.entity';
import {
  EntityManager,
  FindManyOptions,
  FindOptions,
  Repository,
} from 'typeorm';
import { CreateWorkshopInput } from '../dto/create-workshop.input';
import { randomUUID } from 'crypto';
import { CourseCategoryService } from 'src/modules/course/services/course-category.service';
import {
  isDate,
  isDateString,
  max,
  length,
  min,
  isUUID,
} from 'class-validator';
import { WorkshopContent, WorkshopContentInput } from '../types/workshop.type';
import { isTimeString } from 'src/lib/utils';
import slugify from 'slugify';
import { REQUEST } from '@nestjs/core';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class WorkshopService {
  private logger = new Logger(WorkshopService.name);
  constructor(
    @Inject(REQUEST) private readonly request: { req: { user: User } },
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    private readonly categoryService: CourseCategoryService,
    private readonly _entityManager: EntityManager,
  ) {}

  private validateWorkshopContents(contents: WorkshopContent[]) {
    // Check contents date validity
    for (const [index, content] of contents.entries()) {
      const startTime = content.startTime;
      const endTime = content.endTime;

      if (!isDateString(content.date, { strict: true }))
        throw new BadRequestException(
          `Invalid date in workshop content ${
            index + 1
          } | Expected a timestamp value`,
        );
      if (!isTimeString(startTime))
        throw new BadRequestException(
          `Invalid startTime in workshop content ${
            index + 1
          } | Expected a timestring value (00:00:00)`,
        );
      if (!isTimeString(endTime))
        throw new BadRequestException(
          `Invalid endTime in workshop content ${
            index + 1
          } | Expected a timestring value (00:00:00)`,
        );
      // Check if startTime is greater than endTime
      const startTimeParts = content.startTime
        .split(':')
        .map((part) => parseInt(part, 10));
      const endTimeParts = content.endTime
        .split(':')
        .map((part) => parseInt(part, 10));

      // Convert parts to milliseconds for comparison
      const startTimeMs =
        (startTimeParts[0] * 3600 +
          startTimeParts[1] * 60 +
          startTimeParts[2]) *
        1000;
      const endTimeMs =
        (endTimeParts[0] * 3600 + endTimeParts[1] * 60 + endTimeParts[2]) *
        1000;

      if (startTimeMs >= endTimeMs) {
        throw new BadRequestException(
          `content startTime cannot be greater than endTime in workshop content ${
            index + 1
          }.`,
        );
      }
    }
  }

  async createWorkshop(args: CreateWorkshopInput) {
    const authUser = this.request.req.user;
    const {
      category: category_id,
      contents,
      description,
      level,
      price,
      requirements,
      thumbnail,
      title,
      what_to_learn,
      scheduled_date,
    } = args;
    const currentDate = new Date();

    // check scheduled_date validity
    const scheduledDate = new Date(scheduled_date);
    if (scheduledDate <= currentDate)
      throw new BadRequestException('Workshop cannot be scheduled in the past');
    this.validateWorkshopContents(contents);

    try {
      const category = await this.categoryService.findOne(category_id);

      return await this.workshopRepository.save({
        category,
        contents,
        description,
        thumbnail,
        price,
        level,
        type: category.course_type,
        requirements,
        what_to_learn,
        scheduled_date,
        title,
        mentor: authUser.mentor,
      });
    } catch (error: any) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new InternalServerErrorException(
        error.message || 'Something went wrong',
      );
    }
  }

  async viewAllWorkshops(args: {
    skip: number;
    take: number;
    type?: string;
    category?: string;
  }) {
    const { skip, take, category, type } = args;
    try {
      const hasCourseTypeCondition = Boolean(type && type !== '');
      const hasCategoryCondition = Boolean(category && category !== '');

      if (category && !isUUID(category))
        throw new BadRequestException('"category" must be a valid uuid');

      const workshopRepository = this._entityManager.getRepository(Workshop);
      let query = workshopRepository
        .createQueryBuilder('workshop')
        .leftJoinAndSelect('workshop.category', 'category')
        .leftJoinAndSelect('workshop.mentor', 'mentor')
        .leftJoinAndSelect('workshop.reviews', 'reviews')
        .leftJoinAndSelect('workshop.type', 'workshop_type')
        .leftJoinAndSelect('mentor.user', 'user')
        // .leftJoinAndSelect('mentor.courses', 'mentor_courses')
        // .leftJoinAndSelect('mentor_courses.category', 'mentor_category')
        // .leftJoinAndSelect('mentor_courses.course_type', 'mentor_course_type')
        // .leftJoinAndSelect('mentor_courses.reviews', 'mentor_reviews')
        .skip(skip)
        .take(take);

      if (hasCategoryCondition && hasCourseTypeCondition)
        query = query
          .andWhere('workshop_type.type = :type', { type })
          .andWhere('category.id = :category', { category });
      else if (hasCategoryCondition)
        query = query.where('category.id = :category', { category });
      else if (hasCourseTypeCondition)
        query = query.where('workshop_type.type = :type', {
          type,
        });
      query = query
        .andWhere('workshop.is_draft = :isDraft', { isDraft: false })
        .andWhere('workshop.is_approved = :isApproved', { isApproved: true });

      return await query.getMany();
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      throw error;
    }
  }

  async findWorkshopById(workshopId: string) {
    try {
      if (workshopId && !isUUID(workshopId))
        throw new BadRequestException('"workshopId" must be a valid uuid');

      const workshop = await this.workshopRepository.findOne({
        where: { id: workshopId },
        relations: [
          'category',
          'mentor',
          'reviews',
          'type',
          'mentor.user',
          'mentor.courses.mentor',
          'mentor.courses.mentor.user',
          'mentor.followers',
          'mentor.courses.category',
          'mentor.courses.course_type',
          'mentor.courses.reviews',
        ],
      });
      if (!workshop) throw new NotFoundException('Workshop not found');
      workshop.mentor.courses = workshop.mentor.courses.slice(0, 5);
      return workshop;
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      throw error;
    }
  }
}
