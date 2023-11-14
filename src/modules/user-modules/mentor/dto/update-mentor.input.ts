import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { Column } from 'typeorm';

import { MentorExpLevel, MentorRole } from '../enums/mentor.enum';
import {
  CertificationInput,
  EducationInput,
  PastProjectsInput,
  SkillInput,
  UserAvailabilityInput,
  WorkExperienceInput,
} from './create-mentor.input';

@InputType()
export class UpdateMentorInput {
  @Field({ nullable: true })
  about?: string;

  @Field(() => MentorRole, { nullable: true })
  role?: MentorRole;

  @Field(() => [SkillInput], { nullable: true })
  skills?: SkillInput[];

  @Field(() => [WorkExperienceInput], { nullable: true })
  work_experience?: WorkExperienceInput[];

  @Field(() => [PastProjectsInput], { nullable: true })
  projects?: PastProjectsInput[];

  @Field(() => MentorExpLevel, { nullable: true })
  exp_level?: MentorExpLevel;

  @Field(() => [EducationInput], { nullable: true })
  education_bg?: EducationInput[];

  @Field(() => [CertificationInput], { nullable: true })
  certifications?: CertificationInput[];

  @Field(() => Float, { nullable: true })
  hourly_rate?: number;

  @Field(() => [UserAvailabilityInput], { nullable: true })
  availability?: UserAvailabilityInput[];

  @Field(() => [String], { nullable: true })
  language?: string[];
}
