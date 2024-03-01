import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Subscription } from '../entities/subscription.entity';
import { isUUID } from 'class-validator';
import { CustomStatusCodes } from 'src/common/constants';

@Injectable()
export class SubscriptionService {
  private logger = new Logger(SubscriptionService.name);
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async subscribeToCourse(courseId: string): Promise<any> {
    if (!isUUID(courseId)) throw new BadRequestException('Invalid Course ID');
    try {
      const authUser = this.request.req.user.user;
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!course) throw new NotFoundException('Course not found');
      const sub = await this.subscriptionRepository.save({
        user: authUser,
        course: course,
      });
      return sub;
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      if (error?.code === CustomStatusCodes.DUPLICATE_RESOURCE)
        throw new BadRequestException('Already subscribed');
      throw error;
    }
  }

  async viewSubscribedCourses(): Promise<any> {
    try {
      const baseURL = 'your_base_URL_here'; //* from CDN for videos

      const authUser = this.request.req.user.user;
      const subscriptions = await this.subscriptionRepository.find({
        where: { user: { id: authUser.id } },
        relations: [
          'course',
          'course.category',
          'course.course_type',
          'course.mentor',
          'course.mentor.user',
          'course.reviews',
        ],
      });
      //Todo: Update the video_url for each course and section
      subscriptions.forEach((sub) =>
        sub.course.course_contents.forEach((content) => {
          content.course_sections.forEach((section) => {
            if (section.video_url)
              section.video_url = `${baseURL}/${section.video_url}`;
          });
        }),
      );
      return subscriptions;
    } catch (error) {
      throw error;
    }
  }

  async viewSubscribedCourse(courseId: string): Promise<any> {
    if (!isUUID(courseId)) throw new BadRequestException('Invalid Course ID');
    try {
      const authUser = this.request.req.user.user;
      const course = await this.subscriptionRepository.findOne({
        where: { id: courseId, user: { id: authUser.id } },
      });
      if (!course) throw new NotFoundException('Course not found');
      return course;
    } catch (error) {
      throw error;
    }
  }

  async upgradeToPremium(planId: string, userId: string): Promise<any> {}
}
