import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { CourseCategory } from './entities/category.entity';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Course, CourseCategory]),
  ],
  providers: [CourseResolver, CourseService],
  exports: [TypeOrmModule.forFeature([Course])],
})
export class CourseModule {}
