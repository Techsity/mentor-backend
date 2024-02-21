import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './payment.service';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => String)
  async initiatePayment(
    @Args('amount') amount: number,
    @Args('email') email: string,
  ): Promise<string> {
    const paymentResponse = await this.paymentService.makePayment(
      amount,
      email,
    );
    return paymentResponse.data.authorization_url;
  }
}
