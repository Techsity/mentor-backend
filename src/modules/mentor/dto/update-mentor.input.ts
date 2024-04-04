import { InputType, Field, Float, ObjectType } from '@nestjs/graphql';
import { MentorExpLevel, MentorRole } from '../enums/mentor.enum';
import {
  CertificationInput,
  EducationInput,
  PastProjectsInput,
  SkillInput,
  UserAvailabilityInput,
  WorkExperienceInput,
} from './create-mentor.input';
import { IsOptional } from 'class-validator';

@ObjectType()
@InputType('UpdateMentorInput')
export class UpdateMentorInput {
  @Field({ nullable: true })
  @IsOptional()
  about?: string;

  @Field(() => MentorRole, { nullable: true })
  @IsOptional()
  role?: MentorRole;

  @Field(() => [SkillInput], { nullable: true })
  @IsOptional()
  skills?: SkillInput[];

  @Field(() => [WorkExperienceInput], { nullable: true })
  @IsOptional()
  work_experience?: WorkExperienceInput[];

  @Field(() => [PastProjectsInput], { nullable: true })
  @IsOptional()
  projects?: PastProjectsInput[];

  @Field(() => MentorExpLevel, { nullable: true })
  @IsOptional()
  exp_level?: MentorExpLevel;

  @Field(() => [EducationInput], { nullable: true })
  @IsOptional()
  education_bg?: EducationInput[];

  @Field(() => [CertificationInput], { nullable: true })
  @IsOptional()
  certifications?: CertificationInput[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  hourly_rate?: number;

  @Field(() => [UserAvailabilityInput], { nullable: true })
  @IsOptional()
  availability?: UserAvailabilityInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  language?: string[];
}
