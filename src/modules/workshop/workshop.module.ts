import { Module } from '@nestjs/common';
import { WorkshopService } from './services/workshop.service';
import { WorkshopResolver } from './resolvers/workshop.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';
import { CourseCategory } from '../course/entities/category.entity';
import { CourseType } from '../course/entities/course-type.entity';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    CourseModule,
    TypeOrmModule.forFeature([Workshop, CourseCategory, CourseType]),
  ],
  providers: [WorkshopResolver, WorkshopService],
  exports: [TypeOrmModule.forFeature([Workshop]), WorkshopService],
})
export class WorkshopModule {}
