import { ObjectType, Field } from '@nestjs/graphql';
import { Subscription } from '../../subscription/entities/subscription.entity';
import NotificationDto from 'src/modules/notification/dto/notification.dto';

@ObjectType()
export class UserDTO {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  avatar: string | null;

  @Field()
  country: string;

  @Field(() => [Subscription])
  subscriptions: Subscription[];

  @Field(() => [NotificationDto])
  notifications: NotificationDto[];

  @Field()
  is_online: boolean;

  @Field()
  allow_push_notifications: boolean;

  @Field()
  is_active: boolean;

  @Field()
  is_verified: boolean;

  @Field()
  is_admin: boolean;

  @Field()
  is_mentor: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
