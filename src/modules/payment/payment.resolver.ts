import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => InitializePaymentResponse)
  async initiatePayment(
    @Args('amount') amount: number,
  ): Promise<InitializePaymentResponse> {
    return await this.paymentService.makePayment(amount);
  }
}
