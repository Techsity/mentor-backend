import { InputType, Field, registerEnumType } from '@nestjs/graphql';

@InputType()
export class CreateAppointmentInput {
  @Field()
  date: Date;

  @Field()
  time: string;
}
