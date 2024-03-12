import { Global } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { Course } from 'src/modules/course/entities/course.entity';
import { NotificationResourceType } from 'src/modules/notification/enums';
import { NotificationService } from 'src/modules/notification/notification.service';
import { User } from 'src/modules/user/entities/user.entity';

@Global()
export class EventEmitterListeners {
  constructor(private notificationService: NotificationService) {}

  @OnEvent(EVENTS.NEW_COURSE_NOTIFICATION)
  sendNewCourseNotification({
    followers,
    course,
  }: {
    followers: User[];
    course: Course;
  }) {
    console.log({ followers });
    for (const follower of followers) {
      this.notificationService.create(follower, {
        title: 'New Course Published',
        body: 'New Test Notification Body',
        resourceId: course.id,
        resourceType: NotificationResourceType.COURSES,
      });
    }
  }
}

// Todo: implement logout
