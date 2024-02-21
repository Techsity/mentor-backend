import { registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';
import { ReviewType } from '../enums/review.enum';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  type: ReviewType;

  @ManyToOne(() => Mentor, { nullable: true })
  @JoinColumn({ name: 'mentor_id' })
  mentor?: Mentor;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course?: Course;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by: User;

  @Column()
  content: string;

  @Column()
  ratings: number;
}

registerEnumType(ReviewType, {
  name: 'ReviewType',
  description: 'Review Types',
});
