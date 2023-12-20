import { ObjectType, Field } from '@nestjs/graphql';
import { Course } from '../entities/course.entity';
import { Column } from 'typeorm';
import { CourseType } from '../entities/course-type.entity';

@ObjectType()
export class CourseCategoryDto {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => CourseType)
  category_type: CourseType;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
