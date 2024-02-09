import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCourseCatInput,
  UpdateCourseCatInput,
} from '../dto/course-category.input';
import { CourseCategory } from '../entities/category.entity';
import { CourseType } from '../entities/course-type.entity';
import { CourseCategoryDto } from '../dto/course-category.dto';

@Injectable()
export class CourseCategoryService {
  constructor(
    @InjectRepository(CourseCategory)
    private categoryRepository: Repository<CourseCategory>,
    @InjectRepository(CourseType)
    private courseTypeRepository: Repository<CourseType>,
  ) {}

  async createCategory(
    createCourseCatInput: CreateCourseCatInput,
  ): Promise<CourseCategoryDto> {
    const { description, title, type } = createCourseCatInput;
    try {
      let categoryType: CourseType;

      categoryType = await this.courseTypeRepository.findOne({
        where: { type },
      });

      if (!categoryType) {
        categoryType = new CourseType();
        categoryType.type = type;
        await this.courseTypeRepository.save(categoryType);
      }
      const category = new CourseCategory();
      category.category_type = categoryType;
      category.description = description;
      category.title = title;
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating category');
    }
  }

  async viewCourseCategories(): Promise<any> {
    return await this.categoryRepository.find({
      relations: ['category_type'],
    });
  }

  async getAllCourseTypes(
    skip?: number,
    limit?: number,
  ): Promise<CourseType[]> {
    return await this.courseTypeRepository.find({
      relations: ['courses', 'categories'],
      skip: skip || 0,
      take: limit || 10,
    });
  }
}
