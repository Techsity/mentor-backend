import { InputType, Field, Float } from '@nestjs/graphql';
import { CourseLevel } from '../enums/course.enums';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class CourseSectionInput {
  @Field()
  @IsNotEmpty({ message: "'course_sections.section_name' is required" })
  @IsString({
    message: "'course_sections.section_name' must be a string value",
  })
  section_name: string;

  @IsNotEmpty({ message: "'course_sections.video_url' cannot be empty" })
  @IsString({ message: "'course_sections.video_url' must be a string value" })
  @Field({ nullable: true })
  video_url: string;

  @IsNotEmpty({ message: "'course_sections.notes' is required" })
  @IsString({ message: "'course_sections.notes' must be a string value" })
  @Field()
  notes: string;
}

@InputType()
export class CourseContentInput {
  @IsNotEmpty({ message: "'course_contents.title' is required" })
  @IsString({ message: "'course_contents.title' must be a string value" })
  @Field()
  title: string;

  @IsNotEmpty({ message: "'course_contents.course_sections' is required" })
  @IsArray({ message: "'course_contents.course_sections' must be an array" })
  @Field(() => [CourseSectionInput])
  course_sections: CourseSectionInput[];
}

@InputType()
export class CreateCourseInput {
  @IsNotEmpty({ message: "'title' is required" })
  @IsString({ message: "'title' must be a string value" })
  @Field()
  title: string;

  @IsNotEmpty({ message: "'course_level' is required" })
  @Field(() => CourseLevel)
  course_level: CourseLevel;

  @IsNotEmpty({ message: "'description' is required" })
  @IsString({ message: "'description' must be a string value" })
  @Field()
  description: string;

  @IsOptional({ message: "'course_type' cannot be empty" })
  @IsString({ message: "'course_type' must be a string value" })
  @Field({ nullable: true })
  course_type?: string;

  @IsNotEmpty({ message: "'category' is required" })
  @IsString({ message: "'category' must be a string value" })
  @IsUUID('all', { message: "Invalid 'category' - Expected a uuid" })
  @Field()
  category: string;

  @IsNotEmpty({ message: "'what_to_learn' is required" })
  @IsArray({ message: "'what_to_learn' must be an array" })
  @Field(() => [String])
  what_to_learn: string[];

  @IsNotEmpty({ message: "'requirements' is required" })
  @IsArray({ message: "'requirements' must be an array" })
  @Field(() => [String])
  requirements: string[];

  @IsNotEmpty({ message: "'price' is required" })
  @IsNumber({ allowNaN: false }, { message: "'price' must be a float value" })
  @Field(() => Float)
  price: number;

  @IsNotEmpty({ message: "'course_images' is required" })
  @IsString({ message: "'course_images' must be a string value" })
  @Field()
  course_images: string;

  @IsNotEmpty({ message: "'course_contents' is required" })
  @IsArray({ message: "'course_contents' must be an array" })
  @Field(() => [CourseContentInput])
  course_contents: CourseContentInput[];
}
