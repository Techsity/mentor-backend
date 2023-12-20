import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Course } from '../../course/entities/course.entity';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 10, nullable: true, unique: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Field()
  @Column({ type: 'boolean', default: false })
  is_online: boolean;

  @Field()
  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Field()
  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Field()
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Field()
  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @OneToOne(() => Mentor, (mentor) => mentor.user, { eager: true })
  mentor: Mentor;

  @OneToMany(() => Appointment, (appointment) => appointment.mentor)
  appointments: Appointment[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @ManyToMany(() => Mentor, (mentor) => mentor.followers)
  @JoinTable()
  following: Mentor[];

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
