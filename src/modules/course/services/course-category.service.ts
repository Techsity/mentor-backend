import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
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

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['course_type'],
    });
    if (!category)
      throw new BadRequestException(
        "Category with the 'category_id' doesn't exist. provide a 'course_type'",
      );
    return category;
  }

  async createCategory(createCourseCatInput: CreateCourseCatInput) {
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
      let category = this.categoryRepository.create({
        course_type: categoryType,
        description,
        title,
      });
      category.generateSlug();
      category = await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating category');
    }
  }

  async viewCourseCategories(args?: { courseType?: string }): Promise<any> {
    const { courseType } = args || {};
    const options: FindManyOptions<CourseCategory> = courseType
      ? { where: { course_type: { type: courseType } } }
      : {};
    return await this.categoryRepository.find({
      relations: ['course_type'],
      ...options,
    });
  }

  async getAllCourseTypes(
    skip?: number,
    limit?: number,
  ): Promise<CourseType[]> {
    return await this.courseTypeRepository.find({
      relations: ['courses', 'categories', 'workshops'],
      skip: skip || 0,
      take: limit || 10,
    });
  }
}
