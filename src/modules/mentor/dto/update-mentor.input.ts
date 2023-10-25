import { CreateMentorInput } from './create-mentor.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMentorInput extends PartialType(CreateMentorInput) {
  @Field(() => Int)
  id: number;
}
