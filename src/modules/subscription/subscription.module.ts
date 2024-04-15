import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionResolver } from './resolvers/subscription.resolver';
import { UserModule } from '../user/user.module';
import { CourseModule } from '../course/course.module';
import { WorkshopModule } from '../workshop/workshop.module';
import { Payment } from '../payment/entities/payment.entity';

@Module({
  imports: [
    forwardRef(() => UserModule),
    CourseModule,
    WorkshopModule,
    TypeOrmModule.forFeature([Subscription, Payment]),
  ],
  providers: [SubscriptionResolver, SubscriptionService],
  exports: [TypeOrmModule.forFeature([Subscription]), SubscriptionService],
})
export class SubscriptionModule {}
