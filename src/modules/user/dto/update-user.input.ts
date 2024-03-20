import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  avatar: string | null;

  @Field({ nullable: true })
  @IsOptional()
  country: string;
}
