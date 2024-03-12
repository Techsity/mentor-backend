import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsString({ message: 'notification title is required' })
  @IsNotEmpty({ message: 'notification title is required' })
  title: string;
  @IsOptional({ message: 'notification body cannot be empty' })
  @Field()
  body: string;
}
