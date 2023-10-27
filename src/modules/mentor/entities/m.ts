// import {
//   ObjectType,
//   Field,
//   ID,
//   Int,
//   registerEnumType,
//   Float,
// } from '@nestjs/graphql';
// import { IsOptional } from 'class-validator';
// import {
//   Entity,
//   JoinColumn,
//   OneToOne,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { User } from '../../user/entities/user.entity';
// import {
//   PastProjects,
//   Skill,
//   WorkExperience,
//   Education,
//   Certification,
//   UserAvailability,
// } from '../dto/mentor.dto';
// import { MentorExpLevel, MentorRole } from '../enums/mentor.enum';
//
// @ObjectType()
// @Entity('mentors')
// export class Mentor {
//   @Field(() => ID)
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//
//   @Field(() => User)
//   @OneToOne(() => User)
//   @JoinColumn({ name: 'user_id' })
//   user: User;
//
//   @Field()
//   @Column({ type: 'text' })
//   about: string;
//
//   @Field(() => MentorRole)
//   @Column({ type: 'enum', enum: MentorRole })
//   role: string;
//
//   @Field(() => [Skill])
//   @Column('jsonb')
//   skills: Skill[];
//
//   @IsOptional()
//   @Field(() => [WorkExperience])
//   @Column('jsonb')
//   work_experience: WorkExperience[];
//
//   @IsOptional()
//   @Field(() => [PastProjects])
//   @Column('jsonb')
//   projects: PastProjects[];
//
//   @Field(() => MentorExpLevel)
//   @Column({ type: 'enum', enum: MentorExpLevel })
//   exp_level: string;
//
//   @IsOptional()
//   @Field(() => [Education])
//   @Column('jsonb')
//   education_bg: Education[];
//
//   @IsOptional()
//   @Field(() => [Certification])
//   @Column('jsonb')
//   certifications: Certification[];
//
//   @Field(() => Float)
//   @Column({ type: 'int' })
//   hourly_rate: number;
//
//   @IsOptional()
//   @Field(() => UserAvailability)
//   @Column('jsonb')
//   availability: UserAvailability;
//
//   @IsOptional()
//   @Field(() => [String])
//   @Column('text', { array: true })
//   language: string[];
//
//   @IsOptional()
//   @Field(() => Boolean)
//   @Column({ default: false })
//   mentor_verified: boolean;
//
//   @Field(() => Date)
//   @CreateDateColumn()
//   created_at: Date;
//
//   @Field(() => Date)
//   @UpdateDateColumn()
//   updated_at: Date;
// }
//
// registerEnumType(MentorExpLevel, {
//   name: 'MentorExpLevel',
//   description: 'Experience level of mentors',
// });
//
// registerEnumType(MentorRole, {
//   name: 'MentorRole',
//   description: 'Different roles of mentors',
// });
