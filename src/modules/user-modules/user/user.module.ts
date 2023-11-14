import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { MentorModule } from '../mentor/mentor.module';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    forwardRef(() => MentorModule),
    forwardRef(() => CourseModule),
    AuthModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserResolver, UserService],
  exports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
