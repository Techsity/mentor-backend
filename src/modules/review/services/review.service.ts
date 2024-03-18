import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Review } from '../entities/review.entity';
import { ReviewType } from '../enums/review.enum';
import { CreateReviewArgs } from '../dto/review.args';

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
  async createReview(args: CreateReviewArgs): Promise<any> {
    const authUser = this.request.req.user;

    try {
      const { createReviewInput, mentorId, courseId } = args;

      // Check for exclusive mentorId or courseId
      if ((!mentorId && !courseId) || (mentorId && courseId)) {
        throw new Error(
          'You must provide either mentorId or courseId, but not both',
        );
      }

      let getReview;
      let type;

      if (mentorId) {
        // // check if
        // if
        getReview = await this.reviewRepository.findOne({
          where: { mentor: { id: mentorId } },
          relations: ['mentor'],
        });
        type = ReviewType.MENTOR_REVIEW;
        if (getReview)
          throw new Error('You have already reviewed this Mentor!');
      }

      if (courseId) {
        getReview = await this.reviewRepository.findOne({
          where: { course: { id: courseId } },
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
