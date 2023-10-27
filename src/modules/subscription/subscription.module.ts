import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionResolver } from './resolvers/subscription.resolver';

@Module({
  providers: [SubscriptionResolver, SubscriptionService],
})
export class SubscriptionModule {}
