import { Global } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import EVENTS from 'src/common/events.constants';
import { NotificationResourceType } from 'src/modules/notification/enums';
import { NotificationService } from 'src/modules/notification/notification.service';
import { INewCourseNotification } from 'src/modules/notification/types';

@Global()
export class EventEmitterListeners {
  constructor(private notificationService: NotificationService) {}

  @OnEvent(EVENTS.NEW_COURSE_NOTIFICATION)
  sendNewCourseNotification({
    followers,
    course,
    mentorUser,
  }: INewCourseNotification) {
    for (const follower of followers) {
      this.notificationService.create(follower, {
        title: 'New Course Published',
        body: `${mentorUser.name} has published a new course. Check it out!`,
        resourceId: course.id,
        resourceType: NotificationResourceType.COURSES,
      });
    }
  }
}

// Todo: implement logout
