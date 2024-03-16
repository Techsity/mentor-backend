import { Field, Float, ObjectType } from '@nestjs/graphql';
import { CourseCategoryDto } from 'src/modules/course/dto/course-category.dto';
import { CourseTypeDto } from 'src/modules/course/dto/course-type.dto';
import { MentorDTO } from 'src/modules/mentor/dto/mentor.dto';
import { WorkshopContent } from '../types/workshop.type';
import { ReviewDto } from 'src/modules/review/dto/review.dto';

@ObjectType('workshops')
export default class WorkshopDto {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  level: string;

  @Field()
  description: string;

  @Field()
  scheduled_date: string;

  @Field(() => CourseTypeDto)
  type: CourseTypeDto;

  @Field(() => CourseCategoryDto)
  category: CourseCategoryDto;

  @Field(() => MentorDTO)
  mentor: MentorDTO;

  @Field(() => [String!])
  what_to_learn: string[];

  @Field(() => [String!])
  requirements: string[];

  @Field(() => Float)
  price: number;

  @Field()
  course_images: string;

  @Field(() => Boolean)
  is_concluded: boolean;

  @Field(() => Boolean)
  is_draft: boolean;

  @Field(() => Boolean)
  is_approved: boolean;

  @Field(() => [WorkshopContent])
  contents: WorkshopContent[];

  @Field(() => [ReviewDto], { nullable: true })
  reviews: ReviewDto[];

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
