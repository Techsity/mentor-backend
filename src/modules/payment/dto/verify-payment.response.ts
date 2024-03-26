import { Field, ObjectType } from '@nestjs/graphql';
import { AppointmentDTO } from 'src/modules/appointment/dto/appointment.dto';
import { SubscriptionDto } from 'src/modules/subscription/dto/subscription.dto';

@ObjectType()
export default class VerifyPaymentDTO {
  @Field(() => SubscriptionDto, { nullable: true })
  subscription?: SubscriptionDto;

  @Field(() => AppointmentDTO, { nullable: true })
  appointment?: AppointmentDTO;
}
