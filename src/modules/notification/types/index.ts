import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/user/entities/user.entity';

export interface INewCourseNotification {
  followers: User[];
  course: Course;
}
