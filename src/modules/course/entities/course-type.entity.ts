import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Entity,
} from 'typeorm';
import { CourseCategory } from './category.entity';
import { Course } from './course.entity';
import { CourseTypeEnum } from '../enums/course.enums';
import { Workshop } from 'src/modules/workshop/entities/workshop.entity';

@ObjectType()
@Entity('course-types')
export class CourseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'enum', enum: CourseTypeEnum, unique: true })
  type: string;

  @OneToMany(() => CourseCategory, (category) => category.course_type, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  categories: CourseCategory[];

  @OneToMany(() => Course, (course) => course.course_type, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  courses: Course[];

  @OneToMany(() => Workshop, (workshop) => workshop.type, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  workshops: Workshop[];

  @Field()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

registerEnumType(CourseTypeEnum, {
  name: 'CourseTypeEnum',
  description: 'Course types',
});
