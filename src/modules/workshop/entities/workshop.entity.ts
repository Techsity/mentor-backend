import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Entity,
  Check,
  JoinColumn,
  BaseEntity,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { Review } from '../../review/entities/review.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { CourseCategory } from 'src/modules/course/entities/category.entity';
import { CourseType } from 'src/modules/course/entities/course-type.entity';
import { CourseLevel } from 'src/modules/course/enums/course.enums';
import { WorkshopContent } from '../types/workshop.type';

@Entity('workshops')
export class Workshop extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'enum', enum: CourseLevel })
  level: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  scheduled_date: Date;

  @ManyToOne(() => CourseType, (course_type) => course_type.workshops, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'type_id' })
  type: CourseType;

  @ManyToOne(() => CourseCategory, (category) => category.workshops, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: CourseCategory;

  @ManyToOne(() => Mentor, (mentor) => mentor.workshops)
  @JoinColumn({ name: 'mentor_id' })
  mentor: Mentor;

  @ManyToMany(() => Subscription, (subscription) => subscription.workshop)
  participants?: Subscription[];

  @Column('text', { array: true })
  what_to_learn: string[];

  @Column('text', { array: true })
  requirements: string[];

  @Column({ type: 'double precision' })
  @Check('price >= 0')
  price: number;

  @Column({ type: 'varchar' })
  thumbnail: string;

  @Column({ type: 'boolean', default: false })
  is_concluded: boolean;

  @Column({ type: 'boolean', default: true })
  is_draft: boolean;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @Column('jsonb')
  contents: WorkshopContent[];

  @OneToMany(() => Review, (review) => review.workshop)
  reviews: Review[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
