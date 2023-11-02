import { Resolver } from '@nestjs/graphql';
import { SubscriptionService } from '../services/subscription.service';

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}
}
