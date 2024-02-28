import { ObjectType, Field } from '@nestjs/graphql';
import { CourseTypeDto } from './course-type.dto';

@ObjectType()
export class CourseCategoryDto {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => CourseTypeDto)
  course_type: CourseTypeDto;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
