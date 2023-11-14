import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCourseCatInput {
  @Field()
  title: string;

  @Field()
  description: string;
}

@InputType()
export class UpdateCourseCatInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  description: string;
}
