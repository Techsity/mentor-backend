import { registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Entity,
  Check,
  JoinColumn,
  OneToOne,
  BaseEntity,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Review } from '../../review/entities/review.entity';
import { User } from '../../user/entities/user.entity';
import { CourseLevel } from '../enums/course.enums';
import { CourseContent } from '../types/course.type';
import { CourseCategory } from './category.entity';
import { CourseType } from './course-type.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
@Entity('courses')
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'enum', enum: CourseLevel })
  course_level: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => CourseType, (category_type) => category_type.courses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_type_id' })
  category_type: CourseType;

  @ManyToOne(() => CourseCategory, (category) => category.courses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'course_category_id' })
  category: CourseCategory;

  @ManyToOne(() => Mentor, (mentor) => mentor.courses)
  @JoinColumn({ name: 'mentor_id' })
  mentor: Mentor;

  @ManyToMany(() => Subscription, (subscription) => subscription.course)
  subscriptions?: Subscription[];

  @Column('text', { array: true })
  what_to_learn: string[];

  @Column('text', { array: true })
  requirements: string[];

  @Column({ type: 'double precision' })
  @Check('price >= 0')
  price: number;

  @Column({ type: 'varchar' })
  course_images: string;

  @Column({ type: 'boolean', default: true })
  is_draft: boolean;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @Column('jsonb')
  course_contents: CourseContent[];

  @OneToMany(() => Review, (review) => review.course)
  reviews: Review[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

registerEnumType(CourseLevel, {
  name: 'CourseLevel',
  description: 'Different Course levels',
});
