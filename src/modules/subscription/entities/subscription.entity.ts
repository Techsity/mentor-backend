import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
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
import { Workshop } from 'src/modules/workshop/entities/workshop.entity';
import { SubscriptionType } from '../enums/subscription.enum';

@ObjectType()
@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => SubscriptionType)
  @Column({
    default: SubscriptionType.COURSE,
    type: 'enum',
    enum: SubscriptionType,
  })
  type: SubscriptionType;

  @OneToOne(() => Course, (course) => course.subscriptions)
  @JoinColumn({ name: 'course_id' })
  course?: Course;

  @OneToOne(() => Workshop, (workshop) => workshop.participants, {
    nullable: true,
  })
  @JoinColumn({ name: 'workshop_id' })
  workshop?: Workshop;

  @Field({ nullable: true })
  @Column({ nullable: true })
  course_id?: string;

  @Field(() => String)
  @Column({ nullable: true })
  workshop_id?: string;

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

registerEnumType(SubscriptionType, { name: 'SubscriptionType' });
