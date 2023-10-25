import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMentorInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
