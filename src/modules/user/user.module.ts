import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { ReportedMentor } from './entities/reported-mentor.entity';
import { UserService } from './services/user.service';
import { UserResolver } from './resolvers/user.resolver';
import { MentorModule } from '../mentor/mentor.module';
import { CourseModule } from '../course/course.module';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [
    forwardRef(() => MentorModule),
    forwardRef(() => CourseModule),
    forwardRef(() => AppointmentModule),
    AuthModule,
    TypeOrmModule.forFeature([User, ReportedMentor]),
  ],
  providers: [UserResolver, UserService],
  exports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
