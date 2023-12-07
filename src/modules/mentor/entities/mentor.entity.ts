import { registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Review } from '../../review/entities/review.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { User } from '../../user/entities/user.entity';
import { MentorExpLevel, MentorRole } from '../enums/mentor.enum';
import {
  Certification,
  Education,
  Skill,
  PastProjects,
  UserAvailability,
  WorkExperience,
} from '../types/mentor.type';

@Entity('mentors')
export class Mentor extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.mentor)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Course, (courses) => courses.mentor)
  @JoinColumn({ name: 'course_id' })
  courses: Course[];

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  @OneToMany(() => Review, (review) => review.mentor)
  reviews: Review[];

  @OneToMany(() => Appointment, (appointment) => appointment.mentor)
  appointments: Appointment[];

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
