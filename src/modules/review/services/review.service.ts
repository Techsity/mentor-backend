import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Review } from '../entities/review.entity';
import { ReviewType } from '../enums/review.enum';
import { CreateReviewArgs } from '../dto/review.args';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REQUEST) private readonly request: { req: { user: User } },
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async createReview(args: CreateReviewArgs): Promise<any> {
    const authUser = this.request.req.user;

    try {
      const { createReviewInput, mentorId, courseId } = args;
      // Check for exclusive mentorId or courseId
      if ((!mentorId && !courseId) || (mentorId && courseId)) {
        throw new BadRequestException(
          'You must provide either mentorId or courseId, but not both',
        );
      }

      let getReview;
      let type;

      if (mentorId) {
        getReview = await this.reviewRepository.findOne({
          where: { mentor: { id: mentorId }, reviewed_by: { id: authUser.id } },
          relations: ['mentor'],
        });
        type = ReviewType.MENTOR_REVIEW;
        if (getReview)
          throw new Error('You have already reviewed this Mentor!');
      }

      if (courseId) {
        getReview = await this.reviewRepository.findOne({
          where: { course: { id: courseId }, reviewed_by: { id: authUser.id } },
          relations: ['course'],
        });
        type = ReviewType.COURSE_REVIEW;
        if (getReview)
          throw new Error('You have already reviewed this Course!');
      }

      const mentorProfile = mentorId
        ? await this.mentorRepository.findOne({ where: { id: mentorId } })
        : null;
      const courseToReview = courseId
        ? await this.courseRepository.findOne({ where: { id: courseId } })
        : null;

      return await this.reviewRepository.save({
        ...createReviewInput,
        type,
        mentor: mentorProfile,
        course: courseToReview,
        reviewed_by: authUser,
      });
    } catch (error) {
      throw error;
    }
  }
}
