import { ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Entity,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CourseType } from './course-type.entity';
import { Course } from './course.entity';

@ObjectType()
@Entity('course-categories')
export class CourseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => Course, (course) => course.category, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  courses: Course[];

  @ManyToOne(() => CourseType, (category_type) => category_type.categories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_type_id' })
  category_type: CourseType;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
