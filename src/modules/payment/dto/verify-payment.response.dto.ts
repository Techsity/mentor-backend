import { Field, Float, ObjectType } from '@nestjs/graphql';
import { AppointmentDTO } from 'src/modules/appointment/dto/appointment.dto';
import { SubscriptionDto } from 'src/modules/subscription/dto/subscription.dto';
import { JSONObjectScalar } from './transaction.dto';

@ObjectType()
class VerifyPaymentData {
  @Field()
  status: string;
  @Field()
  reference: string;
  @Field(() => Float, { nullable: true })
  amount: number;
  @Field({ nullable: true })
  gateway_response: string;
}
@ObjectType()
export default class VerifyPaymentDTO {
  @Field({ nullable: true })
  display_text: string;
  @Field({ nullable: true })
  reference: string;
  @Field({ nullable: true })
  status: string;
  @Field(() => VerifyPaymentData, { nullable: true })
  data?: VerifyPaymentData;
}
