import {
  ObjectType,
  Field,
  ID,
  Int,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import {
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MentorExpLevel, MentorRole } from '../enums/mentor.enum';

@ObjectType()
@Entity('mentors')
export class Mentor {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @OneToOne(() => User)
  @JoinColumn()
  userId: User;

  @Field()
  @Column({ type: 'text' })
  about: string;

  @Field(() => MentorRole)
  @Column({ type: 'enum', enum: MentorRole })
  role: string;

  @Field(() => [Skill])
  @Column('jsonb', { default: () => '[]' })
  skills: Skill[];

  @Field(() => [WorkExperience])
  @Column('jsonb', { default: () => '[]' })
  work_experience: WorkExperience[];

  @Field(() => [PastProjects])
  @Column('jsonb', { default: () => '[]' })
  projects: PastProjects[];

  @Field(() => MentorExpLevel)
  @Column({ type: 'enum', enum: MentorExpLevel })
  exp_level: string;

  @Field(() => [Education])
  @Column('jsonb', { default: () => '[]' })
  education_bg: Education[];

  @Field(() => [Certification])
  @Column('jsonb', { default: () => '[]' })
  certifications: Certification[];

  @Field(() => Float)
  @Column({ type: 'double' })
  hourly_rate: number;

  @Field(() => UserAvailability)
  @Column('jsonb', { default: () => '{}' })
  availability: UserAvailability;

  @Field(() => [String])
  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  language: string[];

  @Field()
  @Column()
  mentor_verified: boolean;

  @OneToOne(() => User, (user) => user.mentor)
  @JoinColumn()
  user: User;

  @Field(() => Date)
  @CreateDateColumn()
  created_at: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updated_at: Date;
}

@ObjectType()
class Skill {
  @Field()
  skill_name: string;

  @Field()
  years_of_exp: number;
}

@ObjectType()
class WorkExperience {
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

@ObjectType()
class PastProjects {
  @Field()
  company: string;
  @Field()
  job_role: string;
  @Field()
  description: string;
}
@ObjectType()
class Education {
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

@ObjectType()
class Certification {
  @Field()
  organization: string;
  @Field()
  title: string;
  @Field(() => Date)
  year: Date;
}

@ObjectType()
class UserAvailability {
  @Field()
  @Column({ type: 'varchar', length: 255 })
  day: string;

  @Field()
  @Column({ type: 'time' })
  from_time: string;

  @Field()
  @Column({ type: 'time' })
  to_time: string;
}

registerEnumType(MentorExpLevel, {
  name: 'MentorRole',
  description: 'Different roles of mentors',
});

registerEnumType(MentorExpLevel, {
  name: 'MentorRole',
  description: 'Different roles of mentors',
});
