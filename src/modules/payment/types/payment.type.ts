import { registerEnumType } from '@nestjs/graphql';

export enum ISOCurrency {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  ZAR = 'ZAR',
  KES = 'KES',
}

registerEnumType(ISOCurrency, {
  name: 'ISOCurrency',
  description: 'The enum of supported currencies for transactions',
});
