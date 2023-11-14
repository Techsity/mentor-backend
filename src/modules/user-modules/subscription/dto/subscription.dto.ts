import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CourseDto } from '../../course/dto/course.dto';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class SubscriptionDto {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field()
  course: CourseDto;

  @Field()
  is_completed: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
