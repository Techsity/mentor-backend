import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationResourceType } from '../enums';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsString({ message: 'notification title is required' })
  @IsNotEmpty({ message: 'notification title is required' })
  // Todo: add length limit
  title: string;

  @Field()
  @IsString({ message: 'notification body is required' })
  @IsNotEmpty({ message: 'notification body is required' })
  // Todo: add length limit
  body: string;

  @Field({ nullable: true })
  @IsOptional({ message: 'sendEmail is required' })
  sendEmail?: boolean;

  @Field({ nullable: true })
  @IsOptional({ message: 'resourceId is required' })
  resourceId?: string;

  @Field(() => NotificationResourceType, { nullable: true })
  @IsOptional({ message: 'resourceId is required' })
  @IsEnum(NotificationResourceType, {
    message: 'resourceType must be typeof NotificationResourceType',
  })
  resourceType?: NotificationResourceType;
}
