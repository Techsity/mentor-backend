import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsNotEmpty, IsNumberString } from 'class-validator';

@InputType()
export class CreateRegisterInput {
  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Fullname is required' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @Field()
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsNumberString({}, { message: 'Invalid Phone number' })
  phone: string;

  @Field()
  @IsNotEmpty()
  password: string;
}
