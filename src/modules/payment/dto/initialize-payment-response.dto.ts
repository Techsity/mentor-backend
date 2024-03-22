import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InitializePaymentResponse {
  @Field()
  authorization_url: string;
  @Field()
  reference: string;
  @Field()
  status: string;
}
