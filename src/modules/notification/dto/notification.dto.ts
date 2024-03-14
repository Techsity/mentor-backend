import { Field, ObjectType } from '@nestjs/graphql';

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
  @Field(() => Date)
  created_at: Date;
}
