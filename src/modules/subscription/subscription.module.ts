import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionResolver } from './resolvers/subscription.resolver';
import { UserModule } from '../user/user.module';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [UserModule, CourseModule, TypeOrmModule.forFeature([Subscription])],
  providers: [SubscriptionResolver, SubscriptionService],
  exports: [TypeOrmModule.forFeature([Subscription])],
})
export class SubscriptionModule {}
