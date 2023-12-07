import { Field, ArgsType } from '@nestjs/graphql';
import { CreateReviewInput } from './create-review.input';

@ArgsType()
export class CreateReviewArgs {
  @Field()
  createReviewInput: CreateReviewInput;
  @Field({ nullable: true })
  mentorId?: string | null;

  @Field({ nullable: true })
  courseId?: string | null;
}
