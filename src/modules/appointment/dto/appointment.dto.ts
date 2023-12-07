import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MentorDTO } from '../../mentor/dto/mentor.dto';
import { UserDTO } from '../../user/dto/user.dto';
import { AppointmentStatus } from '../enums/appointment.enum';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class AppointmentDTO {
  @Field()
  date: Date;

  @Field()
  time: string;

  @Field(() => AppointmentStatus)
  status: AppointmentStatus;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
