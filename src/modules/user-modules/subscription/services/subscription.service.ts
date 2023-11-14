import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}
  async subscribeToCourse(courseId: string): Promise<any> {
    try {
      const authUser = this.request.req.user.user;
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      const sub = await this.subscriptionRepository.save({
        user: authUser,
        course: course,
      });
      return sub;
    } catch (error) {
      throw error;
    }
  }
  async viewSubscribedCourses(): Promise<any> {
    try {
      const authUser = this.request.req.user.user;
      const courses = await this.subscriptionRepository.find({
        where: { user: { id: authUser.id } },
        relations: ['course'],
      });
      return courses;
    } catch (error) {
      throw error;
    }
  }

  async viewSubscribedCourse(courseId: string): Promise<any> {
    try {
      const course = await this.subscriptionRepository.findOne({
        where: { id: courseId },
      });
      return course;
    } catch (error) {
      throw error;
    }
  }

  async upgradeToPremium(planId: string, userId: string): Promise<any> {}
}
