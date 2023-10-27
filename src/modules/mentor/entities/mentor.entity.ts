import { registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MentorExpLevel, MentorRole } from '../enums/mentor.enum';
import {
  Certification,
  Education,
  Skill,
  PastProjects,
  UserAvailability,
  WorkExperience,
} from '../types/mentor.types';

@Entity('mentors')
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  about: string;

  @Column({ type: 'enum', enum: MentorRole })
  role: MentorRole;

  @Column('jsonb')
  skills: Skill[];

  @Column('jsonb', { nullable: true })
  work_experience: WorkExperience[];

  @Column('jsonb', { nullable: true })
  projects: PastProjects[];

  @Column({ type: 'enum', enum: MentorExpLevel })
  exp_level: MentorExpLevel;

  @Column('jsonb', { nullable: true })
  education_bg: Education[];

  @Column('jsonb', { nullable: true })
  certifications: Certification[];

  @Column({ type: 'int' })
  hourly_rate: number;

  @Column('jsonb', { nullable: true })
  availability: UserAvailability[];

  @Column('text', { array: true, nullable: true })
  language: string[];

  @Column({ default: false })
  mentor_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

registerEnumType(MentorExpLevel, {
  name: 'MentorExpLevel',
  description: 'Experience level of mentors',
});

registerEnumType(MentorRole, {
  name: 'MentorRole',
  description: 'Different roles of mentors',
});
