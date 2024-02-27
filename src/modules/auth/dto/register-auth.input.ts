import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEmpty, IsNotEmpty, IsNumberString } from 'class-validator';

@InputType()
export class CreateRegisterInput {
  @Field()
  @IsEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @Field()
  @IsEmpty({ message: 'Fullname is required' })
  name: string;

  @Field()
  @IsEmpty({ message: 'Country is required' })
  country: string;

  @Field()
  @IsEmpty({ message: 'Phone number is required' })
  @IsNumberString({}, { message: 'Invalid Phone number' })
  phone: string;

  @Field()
  @IsEmpty()
  password: string;
}
