import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationResourceType } from '../enums';

@ObjectType()
export default class NotificationDto {
  @Field()
  id: string;
  @Field()
  title: string;
  @Field()
  body: string;
  @Field(() => Boolean)
  read: boolean;
  @Field()
  userId: string;
  @Field()
  resourceId: string;
  @Field(() => NotificationResourceType)
  resourceType: string;
  @Field(() => Date)
  created_at: Date;
}
