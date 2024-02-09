import {
  ObjectType,
  Field,
  Int,
  ID,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import { MentorDTO } from '../../mentor/dto/mentor.dto';
import { ReviewDto } from '../../review/dto/review.dto';
import { User } from '../../user/entities/user.entity';
import { CourseCategory } from '../entities/category.entity';
import { CourseLevel, CourseTypeEnum } from '../enums/course.enums';
import { CourseCategoryDto } from './course-category.dto';

@ObjectType()
class CourseSection {
  @Field()
  section_name: string;

  @Field()
  video_url: string;

  @Field()
  notes: string;
}
@ObjectType()
class CourseContent {
  @Field()
  title: string;
  @Field(() => [CourseSection])
  course_sections: CourseSection[];
}

@ObjectType()
export class CourseDto {
  @Field()
  title: string;

  @Field(() => CourseLevel)
  course_level: string;

  @Field()
  description: string;

  // @Field(() => CourseTypeEnum)
  // course_type: string;
  @Field(() => CourseCategoryDto)
  category: CourseCategoryDto;

  @Field(() => [String])
  what_to_learn: string[];

  @Field(() => [String])
  requirements: string[];

  @Field(() => Float)
  price: number;

  @Field()
  course_images: string;

  @Field(() => [CourseContent])
  course_contents: CourseContent[];

  @Field()
  mentor: MentorDTO;

  @Field(() => [ReviewDto])
  reviews: ReviewDto[];

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}

registerEnumType(CourseLevel, {
  name: 'CourseLevel',
  description: 'Different roles of mentors',
});

