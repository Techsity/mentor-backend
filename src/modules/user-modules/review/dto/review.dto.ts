import { Field, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
} from 'class-validator';
import { ReviewType } from '../enums/review.enum';

@ObjectType()
export class ReviewDto {
  @IsNotEmpty()
  @IsEnum(ReviewType)
  @Field()
  type: ReviewType;

  @IsNotEmpty()
  @IsString()
  @Field()
  content: string;

  @IsOptional()
  @IsUUID()
  @Field()
  mentorId?: string;

  @IsOptional()
  @IsUUID()
  @Field()
  courseId?: string;

  @IsOptional()
  @IsInt()
  @Field()
  rating: number;
}
