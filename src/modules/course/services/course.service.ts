import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaService } from 'src/modules/media/media.service';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth/services/auth.service';
import { CourseDto } from '../dto/course.dto';
import { CreateCourseInput } from '../dto/create-course.input';
import { UpdateCourseInput } from '../dto/update-course.input';
import { Course } from '../entities/course.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private readonly _entityManager: EntityManager,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private authService: AuthService,
    private mediaService: MediaService,
  ) {}
  async createCourse(
    createCourseInput: any,
    files: any[],
  ): Promise<CreateCourseInput> {
    return await this._entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = this.request.req.user.user;
          const savedCourse = await transactionalEntityManager.save(Course, {
            ...createCourseInput,
            user,
          });
          // If course saved successfully, upload videos
          if (savedCourse) {
            const videoPaths = await this.mediaService.uploadVideosConcurrently(
              user,
              files,
            );

            // Update course_contents with video URLs
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
            await transactionalEntityManager.save(Course, savedCourse);
          }
          return savedCourse;
        } catch (error) {
          throw error;
        }
      },
    );
  }

  async deleteCourse(courseId: string) {
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
      return this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['category', 'mentor', 'reviews'],
      });
    } catch (error) {
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
      const baseURL = 'your_base_URL_here'; // from CDN for videos
      const query = this.courseRepository
        .createQueryBuilder('courses')
        .leftJoinAndSelect('courses.category', 'category')
        .leftJoinAndSelect('courses.category_type', 'category_type')
        .orderBy('courses.id', 'ASC');

      let hasCategoryCondition = false;
      let hasCourseTypeCondition = false;

      if (category) {
        query.where('category.title = :title', { title: category });
        hasCategoryCondition = true;
      }

      if (courseType) {
        if (hasCategoryCondition) {
          query.andWhere('category_type.type = :type', { type: courseType });
        } else {
          query.where('category_type.type = :type', { type: courseType });
        }
        hasCourseTypeCondition = true;
      }

      let courses = [];

      if (hasCategoryCondition || hasCourseTypeCondition) {
        courses = await query.skip(skip).take(take).getMany();

        // If both category and courseType are provided but no courses are found, return an empty array.
        if (
          hasCategoryCondition &&
          hasCourseTypeCondition &&
          courses.length === 0
        ) {
          return [];
        }
      } else {
        // If neither category nor courseType is provided, return all courses.
        courses = await query.skip(skip).take(take).getMany();
      }

      // Update the video_url for each course and section
      // courses.forEach((course) => {
      //   course.course_contents.forEach((content) => {
      //     content.course_sections.forEach((section) => {
      //       if (section.video_url) {
      //         section.video_url = `${baseURL}/${section.video_url}`;
      //       }
      //     });
      //   });
      // });

      return courses;
    } catch (error) {
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
