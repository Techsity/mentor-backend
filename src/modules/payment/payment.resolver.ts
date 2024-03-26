import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';
import { ISOCurrency } from './types/payment.type';
import VerifyPaymentDTO from './dto/verify-payment.response';

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
    return await this.paymentService.initiatePayment(
      amount,
      resourceId,
      resourceType,
      currency,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => VerifyPaymentDTO)
  async verifyPayment(@Args('reference') reference: string) {
    return await this.paymentService.verifyPayment(reference);
  }
}
