import { ObjectType, Field } from '@nestjs/graphql';
import { Course } from '../entities/course.entity';

@ObjectType()
export class CourseCategoryDto {
  @Field()
  title: string;

  @Field()
  description: string;

  // @Field(() => [Course])
  // courses: Course[];

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
