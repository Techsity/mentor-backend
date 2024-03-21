import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async initiatePayment(@Args('amount') amount: number): Promise<string> {
    const paymentResponse = await this.paymentService.makePayment(amount);
    return paymentResponse.data.authorization_url;
  }
}
