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

  async viewSubscriptions(subscriptionType: SubscriptionType): Promise<any> {
    if (!subscriptionType || !isEnum(subscriptionType, SubscriptionType))
      throw new BadRequestException('Invalid "subscriptionType"');

    const authUser = this.request.req.user;
    const relations: string[] =
      subscriptionType === SubscriptionType.COURSE
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
        where: { user: { id: authUser.id }, type: subscriptionType },
        relations,
      });
      if (subscriptionType === SubscriptionType.COURSE) {
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

  async viewSubscription(
    subscriptionId: string,
    subscriptionType: SubscriptionType,
  ): Promise<any> {
    if (!subscriptionType || !isEnum(subscriptionType, SubscriptionType))
      throw new BadRequestException('Invalid subscription "type"');

    const authUser = this.request.req.user;
    const relations: string[] =
      subscriptionType === SubscriptionType.COURSE
        ? [
            'course',
            'course.category',
            'course.course_type',
            'course.mentor',
            'course.mentor.courses',
            'course.mentor.followers',
            'course.mentor.user',
            'course.reviews',
          ]
        : [
            'workshop',
            'workshop.category',
            'workshop.type',
            'workshop.mentor',
            'workshop.mentor.courses',
            'workshop.mentor.followers',
            'workshop.mentor.user',
            'workshop.reviews',
          ];
    const options: FindOneOptions<Subscription> = {
      where: [
        {
          id: subscriptionId,
          user: { id: authUser.id },
          type: subscriptionType,
        },
        {
          course_id: subscriptionId,
          user: { id: authUser.id },
          type: subscriptionType,
        },
        {
          workshop_id: subscriptionId,
          user: { id: authUser.id },
          type: subscriptionType,
        },
      ],
    };
    if (!isUUID(subscriptionId))
      throw new BadRequestException(`Invalid subscription Id`);

    // &&
    // if (subscriptionType === SubscriptionType.COURSE)
    //   options.course_id = resourceId;
    // else if (subscriptionType === SubscriptionType.WORKSHOP)
    //   options.workshop_id = resourceId;

    try {
      const sub = await this.subscriptionRepository.findOne({
        ...options,
        relations,
      });
      if (!sub) throw new NotFoundException('Subscription not found');
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
