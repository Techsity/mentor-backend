import { Resolver } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}
}
