import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../../lib/custom-decorators';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { User } from '../../user/entities/user.entity';
import { SubscriptionDto } from '../dto/subscription.dto';
import { SubscriptionService } from '../services/subscription.service';
import { Subscription } from '../entities/subscription.entity';

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(GqlAuthGuard)
  @Query((returns) => [SubscriptionDto])
  async viewSubscribedCourses(): Promise<any> {
    return this.subscriptionService.viewSubscribedCourses();
  }

  @UseGuards(GqlAuthGuard)
  @Query((returns) => Subscription)
  async viewSubscribedCourse(@Args('courseId') courseId: string): Promise<any> {
    return this.subscriptionService.viewSubscribedCourse(courseId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => Subscription)
  async subscribeToCourse(@Args('courseId') courseId: string): Promise<any> {
    return this.subscriptionService.subscribeToCourse(courseId);
  }
}
