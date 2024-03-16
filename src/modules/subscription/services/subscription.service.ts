import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Subscription } from '../entities/subscription.entity';
import { isEnum, isUUID } from 'class-validator';
import { CustomStatusCodes } from 'src/common/constants';
import { Workshop } from 'src/modules/workshop/entities/workshop.entity';
import { SubscriptionType } from '../enums/subscription.enum';

@Injectable()
export class SubscriptionService {
  private logger = new Logger(SubscriptionService.name);
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Workshop)
    private workshopRepository: Repository<Workshop>,
  ) {}

  async viewSubscriptions(type: SubscriptionType): Promise<any> {
    if (!type || !isEnum(type, SubscriptionType))
      throw new BadRequestException('Invalid subscription "type"');

    const authUser = this.request.req.user;
    const relations: string[] =
      type === SubscriptionType.COURSE
        ? [
            'course',
            'course.category',
            'course.course_type',
            'course.mentor',
            'course.mentor.user',
            'course.reviews',
          ]
        : [
            'workshop',
            'workshop.category',
            'workshop.type',
            'workshop.mentor',
            'workshop.mentor.user',
            'workshop.reviews',
          ];
    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { user: { id: authUser.id }, type },
        relations,
      });
      if (type === SubscriptionType.COURSE) {
        const baseURL = 'your_base_URL_here'; //* from CDN for videos
        //Todo: Update the video_url for each course and section
        subscriptions.forEach((sub) =>
          sub.course.course_contents.forEach((content) => {
            content.course_sections.forEach((section) => {
              if (section.video_url)
                section.video_url = `${baseURL}/${section.video_url}`;
            });
          }),
        );
      }
      return subscriptions;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param resourceId - either courseId or workshopId
   * @param subscriptionType - subscription type (SubscriptionType.COURSE or SubscriptionType.WORKSHOP)
   */

  async viewSubscription(
    resourceId: string,
    subscriptionType: SubscriptionType,
  ): Promise<any> {
    if (!subscriptionType || !isEnum(subscriptionType, SubscriptionType))
      throw new BadRequestException('Invalid subscription "type"');

    const authUser = this.request.req.user;
    const options: FindOptionsWhere<Subscription> = {
      user: { id: authUser.id },
      type: subscriptionType,
    };

    if (subscriptionType === SubscriptionType.COURSE) {
      // &&
      if (!isUUID(resourceId))
        throw new BadRequestException('Invalid Course ID');
      options.course_id = resourceId;
    } else if (subscriptionType === SubscriptionType.WORKSHOP) {
      if (!isUUID(resourceId))
        throw new BadRequestException('Invalid Workshop ID');
      options.workshop_id = resourceId;
    }
    try {
      const sub = await this.subscriptionRepository.findOne({
        where: options,
      });
      if (!sub) {
        const resource =
          subscriptionType === SubscriptionType.COURSE ? 'Course' : 'Workshop';
        throw new NotFoundException(resource + ' not found');
      }
      return sub;
    } catch (error) {
      throw error;
    }
  }

  async subscribeToCourse(courseId: string): Promise<any> {
    if (!isUUID(courseId)) throw new BadRequestException('Invalid Course ID');
    try {
      const authUser = this.request.req.user;
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['mentor.user'],
      });
      if (!course) throw new NotFoundException('Course not found');
      if (course.mentor.user.id === authUser.id)
        throw new BadRequestException("You can't subscribe to your own course");
      const sub = await this.subscriptionRepository.save({
        user: authUser,
        course: course,
      });
      return sub;
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      if (error.code == CustomStatusCodes.DUPLICATE_RESOURCE.toString())
        throw new BadRequestException('Already subscribed');
      throw error;
    }
  }

  async subscribeToWorkshop(workshopId: string): Promise<any> {
    const authUser = this.request.req.user;
    if (!isUUID(workshopId))
      throw new BadRequestException('Invalid workshop id');
    try {
      const workshop = await this.workshopRepository.findOne({
        where: { id: workshopId },
        relations: ['mentor.user'],
      });
      if (!workshop) throw new NotFoundException('Workshop not found');
      if (workshop.mentor.user.id === authUser.id)
        throw new BadRequestException(
          "You can't subscribe to your own workshop",
        );
      const sub = await this.subscriptionRepository.save({
        user: authUser,
        workshop,
        type: SubscriptionType.WORKSHOP,
      });
      return sub;
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      if (error.code == CustomStatusCodes.DUPLICATE_RESOURCE.toString())
        throw new BadRequestException('Already subscribed');
      throw error;
    }
  }

  async upgradeToPremium(planId: string, userId: string): Promise<any> {}
}
