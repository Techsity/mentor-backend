import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { PaymentService } from './services/payment.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { InitializePaymentResponse } from './dto/initialize-payment-response.dto';
import VerifyPaymentDTO from './dto/verify-payment.response.dto';
import { InitializePaymentInput } from './dto/initialize-payment-input.dto';
import { SubscriptionType } from '../subscription/enums/subscription.enum';
import { Payment } from './entities/payment.entity';

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

  @Mutation(() => Payment)
  async confirmPendingTransaction(
    @Args('resourceId') resourceId: string,
    @Args('reference') reference: string,
    @Args({ type: () => SubscriptionType, name: 'resourceType' })
    resourceType: SubscriptionType,
  ) {
    return await this.paymentService.confirmPendingTransaction({
      reference,
      resourceId,
      resourceType,
    });
  }
}
