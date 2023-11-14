import { InputType, Field, Float } from '@nestjs/graphql';
import { CourseLevel } from '../enums/course.enums';

@InputType()
export class CourseSectionInput {
  @Field()
  section_name: string;

  @Field()
  video_url: string;

  @Field()
  notes: string;
}

@InputType()
export class CourseContentInput {
  @Field()
  title: string;

  @Field(() => [CourseSectionInput])
  course_sections: CourseSectionInput[];
}

@InputType()
export class CreateCourseInput {
  @Field()
  title: string;

  @Field(() => CourseLevel)
  course_level: CourseLevel;

  @Field()
  description: string;

  @Field({ nullable: true })
  course_type?: string;

  @Field()
  category: string;

  @Field(() => [String])
  what_to_learn: string[];

  @Field(() => [String])
  requirements: string[];

  @Field(() => Float)
  price: number;

  @Field()
  course_images: string;

  @Field(() => [CourseContentInput])
  course_contents: CourseContentInput[];
}
