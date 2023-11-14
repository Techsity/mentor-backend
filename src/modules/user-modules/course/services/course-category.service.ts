import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCourseCatInput,
  UpdateCourseCatInput,
} from '../dto/course-category.input';
import { CourseCategory } from '../entities/category.entity';

@Injectable()
export class CourseCategoryService {
  constructor(
    @InjectRepository(CourseCategory)
    private categoryRepository: Repository<CourseCategory>,
  ) {}
  async createCategory(
    createCourseCatInput: CreateCourseCatInput,
  ): Promise<CreateCourseCatInput> {
    try {
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async viewCourseCategories(): Promise<any> {
    return this.categoryRepository.find();
  }
}
