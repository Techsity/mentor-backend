import { ObjectType, Field } from '@nestjs/graphql';
import { CourseDto } from '../../course/dto/course.dto';
import WorkshopDto from 'src/modules/workshop/dto/workshop.dto';

@ObjectType()
export class SubscriptionDto {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  course: CourseDto;

  @Field({ nullable: true })
  workshop: WorkshopDto;

  @Field()
  is_completed: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
