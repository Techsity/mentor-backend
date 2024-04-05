import { ObjectType, Field } from '@nestjs/graphql';
import { MentorDTO } from '../../mentor/dto/mentor.dto';
import { UserDTO } from '../../user/dto/user.dto';
import {
  AppointmentRescheduleStatus,
  AppointmentStatus,
} from '../enums/appointment.enum';

@ObjectType()
export class AppointmentDTO {
  @Field()
  id: string;

  @Field()
  paymentReference: string;

  @Field()
  date: Date;

  @Field(() => UserDTO, { nullable: true })
  user: UserDTO;

  @Field(() => AppointmentStatus)
  status: AppointmentStatus;

  @Field(() => MentorDTO)
  mentor: MentorDTO;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
