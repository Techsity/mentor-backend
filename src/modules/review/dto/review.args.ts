import { Field, ArgsType, InputType } from '@nestjs/graphql';
import { CreateReviewInput } from './create-review.input';
import { IsObject, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateReviewArgs {
  @Field()
  @IsObject()
  createReviewInput: CreateReviewInput;

  @Field({ nullable: true })
  @IsOptional()
  mentorId?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  courseId?: string | null;
}
