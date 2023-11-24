import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Review } from '../entities/review.entity';
import { ReviewType } from '../enums/review.enum';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}
  async createReview(
    createReviewInput: any,
    mentorId: string,
    courseId?: string,
  ): Promise<any> {
    try {
      const authUser = this.request.req.user.user;
      const mentorProfile = await this.mentorRepository.findOne({
        where: { id: mentorId },
      });
      const courseToReview = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      let type = ReviewType.COURSE_REVIEW;
      if (mentorProfile) type = ReviewType.MENTOR_REVIEW;

      const newReview = await this.reviewRepository.save({
        ...createReviewInput,
        type,
        mentor: mentorProfile,
        course: courseToReview,
        user: authUser,
      });
      return newReview;
    } catch (error) {
      throw error;
    }
  }
}
