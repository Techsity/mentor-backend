import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MentorDTO } from '../../mentor/dto/mentor.dto';
import { UserDTO } from '../../user/dto/user.dto';
import { AppointmentStatus } from '../enums/appointment.enum';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class AppointmentDTO {
  @Field()
  id: string;

  @Field()
  date: Date;

  @Field(() => AppointmentStatus)
  status: AppointmentStatus;

  @Field(() => MentorDTO)
  mentor: MentorDTO;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
