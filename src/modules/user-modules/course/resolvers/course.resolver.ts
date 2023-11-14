import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
// @ts-ignore
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CourseDto } from '../dto/course.dto';
import { CourseService } from '../services/course.service';
import { Course } from '../entities/course.entity';
import { CreateCourseInput } from '../dto/create-course.input';
import { UpdateCourseInput } from '../dto/update-course.input';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CourseDto)
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @Args({ name: 'files', type: () => [GraphQLUpload] }) files: any[],
  ) {
    return this.courseService.createCourse(createCourseInput, files);
  }

  @Query(() => [CourseDto])
  allCourses(
    @Args('take') take: number,
    @Args('skip') skip: number,
    @Args('courseType') courseType: string,
  ): Promise<CourseDto[]> {
    return this.courseService.allCourses(skip, take, courseType);
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
