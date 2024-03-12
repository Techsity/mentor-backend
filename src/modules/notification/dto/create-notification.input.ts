import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationResourceType } from '../enums';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsString({ message: 'notification title is required' })
  // Todo: add string length limit
  @IsNotEmpty({ message: 'notification title is required' })
  title: string;

  @Field()
  @IsOptional({ message: 'notification body cannot be empty' })
  // Todo: add string length limit
  body: string;

  @Field()
  @IsString({ message: 'resourceId is required' })
  @IsNotEmpty({ message: 'resourceId is required' })
  resourceId: string;

  @Field(() => NotificationResourceType)
  @IsNotEmpty({ message: 'resourceType is required' })
  @IsEnum(NotificationResourceType, {
    message: 'resourceType must be typeof NotificationResourceType',
  })
  resourceType: NotificationResourceType;
}
