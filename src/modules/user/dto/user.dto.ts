import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { CourseDto } from '../../course/dto/course.dto';
import { Course } from '../../course/entities/course.entity';
import { MentorDTO } from '../../mentor/dto/mentor.dto';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

@ObjectType()
export class UserDTO {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  avatar: string | null;

  @Field({ nullable: true })
  country: string;

  @Field()
  subsciptions: Subscription;

  @Field()
  is_online: boolean;

  @Field()
  is_active: boolean;

  @Field()
  is_verified: boolean;

  @Field()
  is_admin: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
