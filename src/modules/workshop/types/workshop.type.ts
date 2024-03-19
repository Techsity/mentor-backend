import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class WorkshopContentInput {
  @Field()
  @IsString({ message: 'content title must be a string' })
  @IsNotEmpty({ message: 'content title is required' })
  title: string;

  @IsNotEmpty({ message: 'content date is required' })
  @IsDateString(
    { strict: true },
    { message: "Invalid date value for content 'date'" },
  )
  @Field()
  date: string;

  @IsString({ message: 'content title must be a string' })
  @IsNotEmpty({ message: 'content title is required' })
  @Field()
  startTime: string;

  @IsString({ message: 'content title must be a string' })
  @IsNotEmpty({ message: 'content endTime is required' })
  @Field()
  endTime: string;
}

@ObjectType()
export class WorkshopContent {
  @Field() title: string;
  @Field() date: string;
  @Field() startTime: string;
  @Field() endTime: string;
}
