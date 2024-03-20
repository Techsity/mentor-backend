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
import { Workshop } from 'src/modules/workshop/entities/workshop.entity';

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

  @ManyToOne(() => Workshop, { nullable: true })
  @JoinColumn({ name: 'workshop_id' })
  workshop?: Workshop;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by: User;

  @Column()
  content: string;

  @Column()
  rating: number;
}

registerEnumType(ReviewType, {
  name: 'ReviewType',
  description: 'Review Types',
});


