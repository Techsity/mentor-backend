import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import * as Upload from 'graphql-upload/Upload.js';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CourseDto } from '../dto/course.dto';
import { CourseService } from '../services/course.service';
import { Course } from '../entities/course.entity';
import { CreateCourseInput } from '../dto/create-course.input';
import MentorRoleGuard from 'src/modules/auth/guards/mentor-role.guard';
import { CourseTypeEnum } from '../enums/course.enums';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(GqlAuthGuard, MentorRoleGuard)
  @Mutation(() => CourseDto)
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @Args({ name: 'files', type: () => [GraphQLUpload] }) files: Upload[],
  ) {
    return this.courseService.createCourse(createCourseInput, files);
  }

  @Query(() => [CourseDto])
  allCourses(
    @Args('take') take: number,
    @Args('skip') skip: number,
    @Args('courseType', { nullable: true }) courseType?: string,
    @Args('category', { nullable: true, description: 'category slug' })
    category?: string,
  ): Promise<CourseDto[]> {
    return this.courseService.allCourses(skip, take, courseType, category);
  }

  @Query(() => [CourseDto])
  searchCoursesByCategory(
    @Args('take') take: number,
    @Args('skip') skip: number,
    @Args('courseId') courseId: string,
  ): Promise<CourseDto[]> {
    return this.courseService.searchCoursesByCategory(skip, take, courseId);
  }

  @Query(() => CourseDto)
  viewCourse(@Args('courseId') courseId: string): Promise<CourseDto> {
    return this.courseService.viewCourse(courseId);
  }
}
