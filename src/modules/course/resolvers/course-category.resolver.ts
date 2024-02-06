import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CourseCategoryDto } from '../dto/course-category.dto';
import {
  CreateCourseCatInput,
  UpdateCourseCatInput,
} from '../dto/course-category.input';
import { CourseCategoryService } from '../services/course-category.service';
import { CourseCategory } from '../entities/category.entity';
import { CourseType } from '../entities/course-type.entity';

@Resolver(() => CourseCategory)
export class CourseCategoryResolver {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}

  // Todo: implement role guard - only admins access
  @Mutation(() => CourseCategoryDto)
  createCategory(
    @Args('createCourseCatInput') createCourseCatInput: CreateCourseCatInput,
  ) {
    return this.courseCategoryService.createCategory(createCourseCatInput);
  }

  @Query(() => [CourseCategoryDto])
  getAllCategories(): Promise<CourseCategoryDto[]> {
    return this.courseCategoryService.viewCourseCategories();
  }

  @Query(() => [CourseType])
  getAllCourseTypes(): Promise<CourseType[]> {
    return this.courseCategoryService.getAllCourseTypes();
  }
}
