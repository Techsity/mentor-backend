import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { CourseDto } from '../../course/dto/course.dto';
import { ReviewDto } from '../../review/dto/review.dto';
import { User } from '../../user/entities/user.entity';
import {
  MentorRole,
  MentorExpLevel,
  AvailailabilityDays,
} from '../enums/mentor.enum';
import { UserDTO } from 'src/modules/user/dto/user.dto';
import Wallet from 'src/modules/wallet/entities/wallet.entity';
import { AppointmentDTO } from 'src/modules/appointment/dto/appointment.dto';

@ObjectType()
export class SkillDTO {
  @Field()
  skill_name: string;

  @Field(() => Int)
  years_of_exp: number;
}
@ObjectType()
export class WorkExperienceDTO {
  @Field()
  company: string;
  @Field()
  job_role: string;
  @Field()
  description: string;
  @Field(() => String)
  from_year: Date;
  @Field(() => String)
  to_year: Date;
}

@ObjectType()
export class EducationDTO {
  @Field()
  school: string;
  @Field()
  credential_type: string;
  @Field()
  course_of_study: string;
  @Field(() => String)
  from_year: Date;
  @Field(() => String)
  to_year: Date;
}

@ObjectType()
class TimeSlot {
  @Field()
  @Column({ type: 'time' })
  startTime: string;

  @Field()
  @Column({ type: 'time' })
  endTime: string;

  @Field(() => Boolean)
  isOpen: boolean;
}
@ObjectType()
export class UserAvailabilityDTO {
  @Field()
  day: string;

  @Field(() => [TimeSlot])
  timeSlots: TimeSlot[];
}
@ObjectType()
export class PastProjectsDTO {
  @Field()
  company: string;
  @Field()
  job_role: string;
  @Field()
  description: string;
}

@ObjectType()
export class CertificationDTO {
  @Field()
  organization: string;
  @Field()
  title: string;
  @Field()
  year: string;
}

@ObjectType()
class IMentorFollowerDTO {
  @Field()
  id: String;
}

@ObjectType()
export class MentorDTO {
  @Field()
  id: string;

  @Field(() => UserDTO, {nullable:true})
  user: UserDTO;

  @Field(() => [CourseDto], { nullable: true })
  courses?: CourseDto[];

  @Field(() => [ReviewDto], { nullable: true })
  reviews?: ReviewDto[];

  @Field()
  about: string;

  @Field()
  role: string;

  @Field(() => [SkillDTO])
  skills: SkillDTO[];

  @Field(() => [AppointmentDTO], { nullable: true })
  appointments: AppointmentDTO[];

  @Field(() => [WorkExperienceDTO], { nullable: true })
  work_experience: WorkExperienceDTO[];

  @Field(() => [PastProjectsDTO], { nullable: true })
  projects: PastProjectsDTO[];

  @Field(() => MentorExpLevel)
  exp_level: MentorExpLevel;

  @Field(() => [EducationDTO], { nullable: true })
  education_bg: EducationDTO[];

  @Field(() => [CertificationDTO], { nullable: true })
  certifications: CertificationDTO[];

  @Field(() => Float)
  hourly_rate: number;

  @Field(() => [UserAvailabilityDTO], { nullable: true })
  availability: UserAvailabilityDTO[];

  @Field(() => [String], { nullable: true })
  language: string[];

  @Field(() => Wallet, { nullable: true })
  wallet: Wallet;

  @Field()
  mentor_verified: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => [IMentorFollowerDTO], { nullable: true })
  followers: Pick<User, 'id'>[];
}
