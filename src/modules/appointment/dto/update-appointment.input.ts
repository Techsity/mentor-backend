import {
  InputType,
  Field,
  PartialType,
  registerEnumType,
} from '@nestjs/graphql';
import { CreateAppointmentInput } from './create-appointment.input';
import { AppointmentStatus } from '../enums/appointment.enum';
@InputType()
export class UpdateAppointmentInput extends PartialType(
  CreateAppointmentInput,
) {
  // @Field({ nullable: true })
  // date?: Date;

  // @Field({ nullable: true })
  // time?: string;

  // @Field((type) => AppointmentStatus, { nullable: true })
  // status?: AppointmentStatus;
}
registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
  description: 'Appointment Statuses',
});
