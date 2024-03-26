import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateAppointmentInput {
  @Field()
  @IsDate({
    message:
      "Invalid date value for 'date' | Expected (yyyy-mm-dd) or (yyyy-mm-ddT00:00.00Z)",
  })
  @IsNotEmpty({ message: 'date is required' })
  date: Date;

  @Field()
  @IsNotEmpty({ message: 'time is required' })
  @IsString({ message: 'time value should be a string' })
  time: string;

  // @Field()
  // @IsNotEmpty({ message: 'paymentReference is required' })
  // @IsString({ message: 'paymentReference value should be a string' })
  // paymentReference: string;
}
