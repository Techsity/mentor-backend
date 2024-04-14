import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './services/payment.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';
import VerifyPaymentDTO from './dto/verify-payment.response';
import { InitializePaymentInput } from './dto/initialize-payment-input.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => InitializePaymentResponse)
  async initiatePayment(
    @Args('input') input: InitializePaymentInput,
  ): Promise<InitializePaymentResponse> {
    return await this.paymentService.initiatePayment(input);
  }

  @Mutation(() => VerifyPaymentDTO)
  async verifyPayment(
    @Args('reference') reference: string,
    @Args('otp') otp: string,
  ) {
    return await this.paymentService.verifyTransaction(reference, otp);
  }
}
