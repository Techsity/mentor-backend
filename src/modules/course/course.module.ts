import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/services/auth.service';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { CourseType } from './entities/course-type.entity';
import { CourseCategoryResolver } from './resolvers/course-category.resolver';
import { CourseCategoryService } from './services/course-category.service';
import { CourseService } from './services/course.service';
import { CourseResolver } from './resolvers/course.resolver';
import { CourseCategory } from './entities/category.entity';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    NotificationModule,
    MediaModule,
    TypeOrmModule.forFeature([Course, CourseCategory, CourseType]),
  ],
  providers: [
    CourseResolver,
    CourseService,
    CourseCategoryResolver,
    CourseCategoryService,
  ],
  exports: [TypeOrmModule.forFeature([Course]), CourseCategoryService],
})
export class CourseModule {}
