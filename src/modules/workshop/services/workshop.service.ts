import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workshop } from '../entities/workshop.entity';
import { Repository } from 'typeorm';
import { CreateWorkshopInput } from '../dto/create-workshop.input';
import { randomUUID } from 'crypto';
import { CourseCategoryService } from 'src/modules/course/services/course-category.service';
import { isDate, isDateString, max, length, min } from 'class-validator';
import { WorkshopContent, WorkshopContentInput } from '../types/workshop.type';
import { isTimeString } from 'src/lib/utils';

@Injectable()
export class WorkshopService {
  private logger = new Logger(WorkshopService.name);
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    private readonly categoryService: CourseCategoryService,
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

  async createWorkshop(input: CreateWorkshopInput) {
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
    } = input;
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
        requirements,
        what_to_learn,
        scheduled_date,
        title,
      });
    } catch (error: any) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new InternalServerErrorException(
        error.message || 'Something went wrong',
      );
    }
  }
}
