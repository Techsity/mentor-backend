import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { Column } from 'typeorm';

import {
  AvailailabilityDays,
  MentorExpLevel,
  MentorRole,
} from '../enums/mentor.enum';

@InputType()
export class SkillInput {
  @Field()
  skill_name: string;

  @Field(() => Int)
  years_of_exp: number;
}

@InputType()
export class WorkExperienceInput {
  @Field()
  company: string;
  @Field()
  job_role: string;
  @Field()
  description: string;
  @Field(() => Date)
  from_year: Date;
  @Field(() => Date)
  to_year: Date;
}

@InputType()
export class EducationInput {
  @Field()
  school: string;
  @Field()
  credential_type: string;
  @Field()
  course_of_study: string;
  @Field(() => Date)
  from_year: Date;
  @Field(() => Date)
  to_year: Date;
}

@InputType()
export class CertificationInput {
  @Field()
  organization: string;
  @Field()
  title: string;
  @Field(() => Date)
  year: Date;
}
@InputType()
class TimeSlotInput {
  @Field()
  @Column({ type: 'time' })
  startTime: string;

  @Field()
  @Column({ type: 'time' })
  endTime: string;
}
@InputType()
export class UserAvailabilityInput {
  @Field()
  day: string;

  @Field(() => [TimeSlotInput])
  timeSlots: TimeSlotInput[];
}

@InputType()
export class PastProjectsInput {
  @Field()
  company: string;
  @Field()
  job_role: string;
  @Field()
  description: string;
}
@InputType()
export class CreateMentorInput {
  @Field()
  about: string;

  @Field()
  role: string;

  @Field(() => [SkillInput])
  skills: SkillInput[];

  @Field(() => [WorkExperienceInput], { nullable: true })
  work_experience?: WorkExperienceInput[];

  @Field(() => [PastProjectsInput], { nullable: true })
  projects?: PastProjectsInput[];

  @Field(() => MentorExpLevel)
  exp_level: MentorExpLevel;

  @Field(() => [EducationInput], { nullable: true })
  education_bg?: EducationInput[];

  @Field(() => [CertificationInput], { nullable: true })
  certifications?: CertificationInput[];

  @Field(() => Float)
  hourly_rate: number;

  @Field(() => [UserAvailabilityInput], { nullable: true })
  availability?: UserAvailabilityInput[];

  @Field(() => [String], { nullable: true })
  language?: string[];
}
