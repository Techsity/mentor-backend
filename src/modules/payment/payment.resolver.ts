import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';
import { SubscriptionDto } from '../subscription/dto/subscription.dto';
import { Subscription } from '../subscription/entities/subscription.entity';
import { ISOCurrency } from './types/payment.type';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => InitializePaymentResponse)
  async initiatePayment(
    @Args('amount') amount: number,
    @Args({
      name: 'resourceType',
      description: 'A value from the SubscriptionType enum',
    })
    resourceType: string,
    @Args({ name: 'resourceId', description: 'Either course or workshop Id ' })
    resourceId: string,
    @Args({ name: 'currency', type: () => ISOCurrency }) currency: ISOCurrency,
  ): Promise<InitializePaymentResponse> {
    return await this.paymentService.makePayment(
      amount,
      resourceId,
      resourceType,
      currency,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SubscriptionDto)
  // @Mutation(() => String)
  async verifyPayment(@Args('reference') reference: string) {
    return await this.paymentService.verifyPayment(reference);
  }
}
