import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { CourseCategory } from './category.entity';

@ObjectType()
export class Course {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  title: string;

  @Field()
  @Column({ type: 'varchar' })
  level: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field()
  @Column({ type: 'text' })
  courseType: string;

  @ManyToOne(() => CourseCategory, (category) => category.courses)
  category: CourseCategory;

  @Field(() => [String])
  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  what_to_learn: string[];

  @Field(() => [String])
  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  requirements: string[];

  @Field()
  @Column({ type: 'double' })
  price: number;

  @Field()
  @Column({ type: 'varchar' })
  course_images: string;

  @Field(() => [CourseContent])
  @Column('jsonb', { default: () => '[]' })
  course_contents: CourseContent[];

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

@ObjectType()
class CourseContent {
  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;
  @Field(() => [CourseSection])
  @Column('jsonb', { default: () => '[]' })
  course_sections: CourseSection[];
}

@ObjectType()
class CourseSection {
  @Field()
  @Column({ type: 'varchar', length: 255 })
  section_name: string;

  @Field()
  @Column({ type: 'varchar' })
  video_url: string;

  @Field()
  @Column({ type: 'text' })
  notes: string;
}
