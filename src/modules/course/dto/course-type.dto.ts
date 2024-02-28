import { ObjectType, Field } from '@nestjs/graphql';
import { Course } from '../entities/course.entity';
import { Column } from 'typeorm';
import { CourseType } from '../entities/course-type.entity';

@ObjectType()
export class CourseTypeDto {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
