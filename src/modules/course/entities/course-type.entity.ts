import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { CourseCategory } from './category.entity';
import { Course } from './course.entity';
import { CourseTypeEnum } from '../enums/course.enums';

@ObjectType()
@Entity('course-types')
export class CourseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'enum', enum: CourseTypeEnum })
  type: string;

  @OneToMany(() => CourseCategory, (category) => category.category_type, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  categories: CourseCategory[];

  @OneToMany(() => Course, (course) => course.category_type, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  courses: Course[];

  @Field()
  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

registerEnumType(CourseTypeEnum, {
  name: 'CourseTypeEnum',
  description: 'Course types',
});
