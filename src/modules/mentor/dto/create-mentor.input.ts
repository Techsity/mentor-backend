import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { MentorExpLevel } from '../enums/mentor.enum';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class SkillInput {
  @Field()
  @IsNotEmpty({ message: "'skill_name' is required" })
  skill_name: string;
  @IsOptional()
  @Field(() => Int, { nullable: true })
  years_of_exp: number;
}

@InputType()
export class WorkExperienceInput {
  @Field()
  @IsNotEmpty({ message: "'company' is required" })
  company: string;
  @Field()
  @IsNotEmpty({ message: "'job_role' is required" })
  job_role: string;
  @Field()
  @IsNotEmpty({ message: "'description' is required" })
  description: string;
  @Field(() => String)
  @IsNotEmpty({ message: "'from_year' is required" })
  from_year: string;
  @Field(() => String)
  @IsNotEmpty({ message: "'to_year' is required" })
  to_year: string;
}

@InputType()
export class EducationInput {
  @Field()
  @IsNotEmpty({ message: "'school' is required" })
  school: string;
  @Field()
  @IsNotEmpty({ message: "'credential_type' is required" })
  credential_type: string;
  @Field()
  @IsNotEmpty({ message: "'course_of_study' is required" })
  course_of_study: string;
  @Field(() => String)
  @IsNotEmpty({ message: "'from_year' is required" })
  from_year: string;
  @Field(() => String)
  @IsNotEmpty({ message: "'to_year' is required" })
  to_year: string;
}

@InputType()
export class CertificationInput {
  @Field()
  @IsNotEmpty({ message: "'organisation' is required" })
  organization: string;
  @Field()
  @IsNotEmpty({ message: "'title' is required" })
  title: string;
  @Field(() => String)
  @IsNotEmpty({ message: "'year' is required" })
  year: string;
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
  @IsNotEmpty({ message: "'day' is required" })
  @Field()
  day: string;

  @IsNotEmpty({ message: "'timeSlots' is required" })
  @IsArray({ message: "'timeSlots' must be an array" })
  @Field(() => [TimeSlotInput])
  timeSlots: TimeSlotInput[];
}

@InputType()
export class PastProjectsInput {
  @Field()
  @IsNotEmpty({ message: "'company' is required" })
  company: string;
  @Field()
  @IsNotEmpty({ message: "'job_role' is required" })
  job_role: string;
  @Field()
  @IsNotEmpty({ message: "'description' is required" })
  description: string;
}
@InputType()
export class CreateMentorInput {
  @Field()
  @IsNotEmpty({ message: "'about' is required" })
  about: string;

  @IsNotEmpty({ message: "'role' is required" })
  @Field()
  role: string;

  @IsNotEmpty({ message: "'skills' is required" })
  @IsArray({ message: "'skills' must be an array" })
  @Field(() => [SkillInput])
  skills: SkillInput[];

  @IsNotEmpty({ message: "'work_experience' is required" })
  @IsArray({ message: "'work_experience' must be an array" })
  @Field(() => [WorkExperienceInput], { nullable: true })
  work_experience?: WorkExperienceInput[];

  @IsNotEmpty({ message: "'projects' is required" })
  @IsArray({ message: "'projects' must be an array" })
  @Field(() => [PastProjectsInput], { nullable: true })
  projects?: PastProjectsInput[];

  @IsNotEmpty({ message: "'exp_level' is required" })
  @Field(() => MentorExpLevel)
  exp_level: MentorExpLevel;

  @IsNotEmpty({ message: "'education_bg' is required" })
  @IsArray({ message: "'education_bg' must be an array" })
  @Field(() => [EducationInput], { nullable: true })
  education_bg?: EducationInput[];

  @IsNotEmpty({ message: "'certifications' is required" })
  @IsArray({ message: "'certifications' must be an array" })
  @Field(() => [CertificationInput], { nullable: true })
  certifications?: CertificationInput[];

  @IsNotEmpty({ message: "'hourly_rate' is required" })
  @IsNumber(
    { allowNaN: false },
    { message: "'hourly_rate' must be a float value" },
  )
  @Field(() => Float)
  hourly_rate: number;

  @IsNotEmpty({ message: "'availability' is required" })
  @IsArray({ message: "'availability' must be an array" })
  @Field(() => [UserAvailabilityInput], { nullable: true })
  availability?: UserAvailabilityInput[];

  @IsNotEmpty({ message: "'language' is required" })
  @IsArray({ message: "'language' must be an array" })
  @Field(() => [String], { nullable: true })
  language?: string[];
}
