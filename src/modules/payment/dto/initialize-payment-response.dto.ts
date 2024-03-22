import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InitializePaymentResponse {
  @Field({ nullable: true })
  authorization_url: string;
  @Field({ nullable: true })
  reference: string;
  @Field({ nullable: true })
  status: string;
}
