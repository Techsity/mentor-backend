import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaService } from 'src/modules/media/media.service';
import { FindManyOptions, Repository } from 'typeorm';
import { AuthService } from '../../auth/services/auth.service';
import { CourseDto } from '../dto/course.dto';
import { CreateCourseInput } from '../dto/create-course.input';
import { UpdateCourseInput } from '../dto/update-course.input';
import { Course } from '../entities/course.entity';
import { EntityManager } from 'typeorm';
import { isUUID } from 'class-validator';
import { CourseCategoryService } from './course-category.service';
import slugify from 'slugify';

@Injectable()
export class CourseService {
  private logger = new Logger(CourseService.name);
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private readonly _entityManager: EntityManager,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private categoryService: CourseCategoryService,
    private authService: AuthService,
    private mediaService: MediaService,
  ) {}

  async createCourse(
    createCourseInput: CreateCourseInput,
    files: any[],
  ): Promise<any> {
    try {
      const {
        category: category_id,
        course_contents,
        course_images,
        course_level,
        description,
        price,
        requirements,
        title,
        what_to_learn,
      } = createCourseInput;
      const user = this.request.req.user.user;
      const category = await this.categoryService.findOne(category_id);

      const savedCourse = this.courseRepository.create({
        title,
        description,
        price,
        mentor: user.mentor,
        what_to_learn,
        category,
        course_contents: course_contents,
        course_images: course_images,
        course_level: course_level,
        course_type: category.course_type,
        requirements,
      });
      // If course saved successfully, upload videos
      if (savedCourse) {
        const videoPaths = await this.mediaService.uploadVideosConcurrently(
          user,
          files,
        );
        // Update course_contents with video URLs
        if (savedCourse.course_contents && savedCourse.course_contents.length)
          savedCourse.course_contents.forEach((content, contentIndex) => {
            content.course_sections.forEach((section, sectionIndex) => {
              // Assuming each section corresponds to a file in the same order
              const videoPath =
                videoPaths[
                  contentIndex * content.course_sections.length + sectionIndex
                ];
              section.video_url = videoPath;
            });
          });
      }
      await this.courseRepository.save(savedCourse);
      return savedCourse;
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw error;
    }
  }

  async deleteCourse(courseId: string) {
    if (!isUUID(courseId)) throw new BadRequestException('Invalid courseId');
    return this.courseRepository.delete(courseId);
  }

  async viewMentorCourse() {}
  async userMentorCourses(
    skip: number,
    take: number,
    courseType: string,
  ): Promise<any[]> {
    try {
      const baseURL = 'your_base_URL_here';
      const courses = await this.courseRepository
        .createQueryBuilder('courses')
        .where('courses.course_type = :course_type', {
          course_type: courseType,
        })
        .leftJoinAndSelect('courses.user', 'user')
        .leftJoinAndSelect('courses.subsciptions', 'subsciptions')
        .orderBy('courses.id', 'ASC')
        .skip(skip)
        .take(take)
        .getMany();

      // Update the video_url for each course and section
      courses.forEach((course) => {
        course.course_contents.forEach((content) => {
          content.course_sections.forEach((section) => {
            if (section.video_url) {
              section.video_url = `${baseURL}/${section.video_url}`;
            }
          });
        });
      });

      return courses;
    } catch (error) {
      throw error;
    }
  }

  async viewRegisteredCourse() {}
  async registeredCourses() {}

  async viewCourse(courseId: string): Promise<any> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: [
          'category',
          'mentor',
          'reviews',
          'course_type',
          'mentor.user',
          'mentor.courses.category',
          'mentor.courses.course_type',
          'mentor.courses.reviews',
        ],
      });
      if (!course) throw new NotFoundException('Course not found');
      return course;
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      throw error;
    }
  }

  async allCourses(
    skip: number,
    take: number,
    courseType: string,
    category: string,
  ): Promise<any[]> {
    try {
      const baseURL = 'your_base_URL_here'; //* from CDN for videos

      const hasCourseTypeCondition = Boolean(courseType && courseType !== '');
      const hasCategoryCondition = Boolean(category && category !== '');
      const slug = hasCategoryCondition ? slugify(category.toLowerCase()) : '';

      const courseRepository = this._entityManager.getRepository(Course);
      console.log({ courseType, category, slug });
      let query = courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.category', 'category')
        .leftJoinAndSelect('course.mentor', 'mentor')
        .leftJoinAndSelect('course.reviews', 'reviews')
        .leftJoinAndSelect('course.course_type', 'course_type')
        .leftJoinAndSelect('mentor.user', 'user')
        .leftJoinAndSelect('mentor.courses', 'mentor_courses')
        .leftJoinAndSelect('mentor_courses.category', 'mentor_category')
        .leftJoinAndSelect('mentor_courses.course_type', 'mentor_course_type')
        .leftJoinAndSelect('mentor_courses.reviews', 'mentor_reviews')
        .skip(skip)
        .take(take);

      if (hasCategoryCondition && hasCourseTypeCondition)
        query = query
          .andWhere('course_type.type = :courseType', { courseType })
          .andWhere('category.slug = :slug', { slug });
      else if (hasCategoryCondition)
        query = query.where('category.slug = :slug', { slug });
      else if (hasCourseTypeCondition)
        query = query.where('course_type.type = :courseType', {
          courseType,
        });

      const courses = await query.getMany();

      //* Update the video_url for each course and section
      /*
        courses.forEach((course) => {
            course.course_contents.forEach((content) => {
                content.course_sections.forEach((section) => {
                    if (section.video_url) {
                        section.video_url = `${baseURL}/${section.video_url}`;
                    }
                });
            });
        });
        */

      return courses;
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      throw error;
    }
  }

  async searchCoursesByCategory(
    skip: number,
    take: number,
    categoryId: string,
  ): Promise<any[]> {
    try {
      return this.courseRepository
        .createQueryBuilder('courses')
        .where('courses.category = :category', { category: categoryId })
        .leftJoinAndSelect('courses.user', 'user')
        .orderBy('courses.id', 'ASC')
        .skip(skip)
        .take(take)
        .getMany();
    } catch (error) {
      throw error;
    }
  }
}
