import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateAppointmentInput {
  @Field()
  @IsDateString({ strict: true }, { message: "Invalid date value for 'date'" })
  @IsNotEmpty({ message: 'content date is required' })
  date: Date;

  @Field()
  time: string;
}
