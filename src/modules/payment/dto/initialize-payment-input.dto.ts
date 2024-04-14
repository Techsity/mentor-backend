import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { ISOCurrency } from '../types/payment.type';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsUUID,
  Length,
} from 'class-validator';
import { SubscriptionType } from 'src/modules/subscription/enums/subscription.enum';

@InputType()
export class InitializePaymentInput {
  @IsNotEmpty({ message: 'amount is required' })
  @IsNumber({}, { message: 'amount should be a number value' })
  @Field(() => Float)
  amount: number;

  @IsNotEmpty({ message: 'currency is required' })
  @IsEnum(ISOCurrency, { message: 'Invalid currency' })
  @Field(() => ISOCurrency)
  currency: ISOCurrency;

  @IsNotEmpty({ message: 'bankCode is required' })
  @IsNumberString({}, { message: 'Invalid bankCode' })
  @Field()
  bankCode: string;

  @IsNotEmpty({ message: 'accountNumber is required' })
  @Length(10, 10, { message: 'accountNumber must be 10-digits' })
  @IsNumberString({}, { message: 'Invalid accountNumber' })
  @Field()
  accountNumber: string;

  @IsNotEmpty({ message: 'birthday is required' })
  @IsDateString({ strict: true }, { message: 'Invalid date for birthday' })
  @Field()
  birthday: string;

  @IsNotEmpty({ message: 'resourceId is required' })
  @IsUUID('all', { message: 'resourceId must be a valid uuid' })
  @Field()
  resourceId: string;

  @IsNotEmpty({ message: 'resourceType is required' })
  @IsEnum(SubscriptionType, {
    message: `Invalid resourceType | Expected either 'course' or 'workshop' or 'mentorship_appointment'`,
  })
  @Field(() => SubscriptionType)
  resourceType: SubscriptionType;
}
