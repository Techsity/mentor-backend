import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { CourseLevel } from 'src/modules/course/enums/course.enums';
import { WorkshopContentInput } from '../types/workshop.type';

@InputType()
export class CreateWorkshopInput {
  @IsString({ message: "'title' must be a string" })
  @IsNotEmpty({ message: "'title' is required" })
  @Field()
  title: string;

  @IsNotEmpty({ message: "'level' is required" })
  @IsEnum(CourseLevel, {
    message: "'level' must be a valid enum from CourseLevel",
  })
  @Field(() => CourseLevel)
  level: CourseLevel;

  //   @IsUUID('all', { message: "'type' must be a valid uuid" })
  //   @IsNotEmpty({ message: "'type' is required" })
  //   @Field({ nullable: true })
  //   type?: CourseTypeEnum;

  @IsUUID('all', { message: "'category' must be a valid uuid" })
  @IsNotEmpty({ message: "'category' is required" })
  @Field()
  category: string;

  @IsDateString(
    { strict: true },
    {
      message: "Invalid date value for 'scheduled_date' | Expected yyyy-mm-dd",
    },
  )
  @IsNotEmpty({ message: "'scheduled_date' is required" })
  @Field()
  scheduled_date: string;

  @IsNotEmpty({ message: "'description' is required" })
  @IsString({ message: "'description' must be a string value" })
  @Field()
  description: string;

  @IsNotEmpty({ message: "'what_to_learn' is required" })
  @IsString({
    message: "each item in 'what_to_learn' must be a string",
    each: true,
  })
  @IsArray({ message: "'what_to_learn' must be an array" })
  @Field(() => [String])
  what_to_learn: string[];

  @IsNotEmpty({ message: "'requirements' is required" })
  @IsArray({ message: "'requirements' must be an array" })
  @IsString({
    message: "each item in 'requirements' must be a string",
    each: true,
  })
  @Field(() => [String])
  requirements: string[];

  @IsNotEmpty({ message: "'price' is required" })
  @IsNumber({ allowNaN: false }, { message: "'price' must be a float value" })
  @Field(() => Float)
  price: number;

  @IsNotEmpty({ message: "'thumbnail' is required" })
  @IsString({ message: "'thumbnail' must be a string value" })
  @Field()
  thumbnail: string;

  // Todo: use the validations from the WorkshopContentInput class
  @IsNotEmpty({ message: "all items in 'contents' are required", each: true })
  @IsArray({ message: "'contents' must be an array" })
  @Field(() => [WorkshopContentInput])
  contents: WorkshopContentInput[];
}
