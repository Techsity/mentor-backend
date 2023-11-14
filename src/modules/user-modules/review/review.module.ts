import { forwardRef, Module } from '@nestjs/common';
import { CourseModule } from '../course/course.module';
import { MentorModule } from '../mentor/mentor.module';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';

@Module({
  imports: [
    forwardRef(() => MentorModule),
    forwardRef(() => CourseModule),
    TypeOrmModule.forFeature([Review]),
  ],
  providers: [ReviewResolver, ReviewService],
  exports: [TypeOrmModule.forFeature([Review])],
})
export class ReviewModule {}
