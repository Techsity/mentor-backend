import {
  ObjectType,
  Field,
  Int,
  ID,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Entity,
  Check,
  JoinColumn,
} from 'typeorm';
import { CourseContent } from '../dto/course.dto';
import { CourseLevel, CourseType } from '../enums/course.enums';
import { CourseCategory } from './category.entity';

@ObjectType()
@Entity('courses')
export class Course {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  title: string;

  @Field(() => CourseLevel)
  @Column({ type: 'enum', enum: CourseLevel })
  course_level: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field(() => CourseType)
  @Column({ type: 'enum', enum: CourseType })
  course_type: string;

  @ManyToOne(() => CourseCategory, (category) => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: CourseCategory;

  @Field(() => [String])
  @Column('text', { array: true })
  what_to_learn: string[];

  @Field(() => [String])
  @Column('text', { array: true })
  requirements: string[];

  @Field(() => Float)
  @Column({ type: 'double precision' })
  @Check('price >= 0')
  price: number;

  @Field()
  @Column({ type: 'varchar' })
  course_images: string;

  @Field(() => [CourseContent])
  @Column('jsonb')
  course_contents: CourseContent[];

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

registerEnumType(CourseLevel, {
  name: 'CourseLevel',
  description: 'Different roles of mentors',
});

registerEnumType(CourseType, {
  name: 'CourseType',
  description: 'Different roles of mentors',
});
