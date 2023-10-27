import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm';

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
@ObjectType()
export class CourseContent {
  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;
  @Field(() => [CourseSection])
  @Column('jsonb', { default: () => '[]' })
  course_sections: CourseSection[];
}
