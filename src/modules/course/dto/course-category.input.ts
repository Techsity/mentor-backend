import { Field, InputType } from '@nestjs/graphql';
import { CourseTypeEnum } from '../enums/course.enums';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCourseCatInput {
  @Field()
  @IsString({ message: 'Title is required' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => CourseTypeEnum)
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(CourseTypeEnum, {
    message: "'type' must be a valid CourseTypeEnum value",
  })
  type: CourseTypeEnum;
}

@InputType()
export class UpdateCourseCatInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  description: string;
}
