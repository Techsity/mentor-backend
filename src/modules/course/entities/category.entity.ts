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
import slugify from 'slugify';
import { Workshop } from 'src/modules/workshop/entities/workshop.entity';

@ObjectType()
@Entity('course-categories')
export class CourseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @OneToMany(() => Course, (course) => course.category, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  courses: Course[];

  @OneToMany(() => Workshop, (workshop) => workshop.category, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  workshops: Workshop[];

  @ManyToOne(() => CourseType, (course_type) => course_type.categories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'course_type' })
  course_type: CourseType;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  generateSlug() {
    this.slug = slugify(this.title, { lower: true });
  }
}
