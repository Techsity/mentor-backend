import { Course } from 'src/modules/course/entities/course.entity';
import { Mentor } from 'src/modules/mentor/entities/mentor.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Workshop } from 'src/modules/workshop/entities/workshop.entity';
import { NotificationResourceType } from '../enums';

export interface INewCourseNotification {
  followers: User[];
  mentorUser: Pick<User, 'name'>;
  course: Course;
}

export interface FollowersNotificationInterface {
  mentor: Mentor;
  title: string;
  body: string;
  resource: Course | Workshop;
  resourceType: NotificationResourceType;
}
