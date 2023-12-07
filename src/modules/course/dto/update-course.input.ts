import { InputType, Field, Float } from '@nestjs/graphql';
import { CourseLevel, CourseTypeEnum } from '../enums/course.enums';
import { CourseContentInput } from './create-course.input';
@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  title?: string;

  @Field(() => CourseLevel, { nullable: true })
  course_level?: CourseLevel;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  course_type?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  what_to_learn?: string[];

  @Field(() => [String], { nullable: true })
  requirements?: string[];

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  course_images?: string;

  @Field(() => [CourseContentInput], { nullable: true })
  course_contents?: CourseContentInput[];
}
