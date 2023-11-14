import { CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  avatar: string | null;

  @Field({ nullable: true })
  country: string;
}
