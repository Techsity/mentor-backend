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
  ManyToOne,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Course, (course) => course.subscriptions)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Field(() => String)
  @Column()
  course_id: string;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
