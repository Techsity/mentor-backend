import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { ISOCurrency } from '../types/payment.type';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  Length,
} from 'class-validator';

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
}
// @Args({
//   name: 'resourceType',
//   description: 'A value from the SubscriptionType enum',
// })
// resourceType: string,
// @Args({ name: 'resourceId', description: 'Either course or workshop Id ' })
// resourceId: string,
