import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../../lib/custom-decorators';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { User } from '../../user/entities/user.entity';
import { SubscriptionDto } from '../dto/subscription.dto';
import { SubscriptionService } from '../services/subscription.service';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionType } from '../enums/subscription.enum';

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(GqlAuthGuard)
  @Query((returns) => [SubscriptionDto])
  async viewSubscriptions(
    @Args('subscriptionType') subscriptionType: SubscriptionType,
  ): Promise<any> {
    return this.subscriptionService.viewSubscriptions(subscriptionType);
  }

  @UseGuards(GqlAuthGuard)
  @Query((returns) => SubscriptionDto)
  async viewSubscription(
    @Args('resourceId') resourceId: string,
    @Args({ name: 'subscriptionType', type: () => SubscriptionType })
    subscriptionType: SubscriptionType,
  ): Promise<any> {
    return this.subscriptionService.viewSubscription(
      resourceId,
      subscriptionType,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => Subscription)
  async subscribeToCourse(@Args('courseId') courseId: string): Promise<any> {
    return this.subscriptionService.subscribeToCourse(courseId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => Subscription)
  async subscribeToWorkshop(
    @Args('workshopId') workshopId: string,
  ): Promise<any> {
    return this.subscriptionService.subscribeToWorkshop(workshopId);
  }
}
