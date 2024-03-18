import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
} from 'class-validator';

@InputType()
export class CreateReviewInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  content: string;

  @IsOptional()
  @IsInt()
  @Field()
  ratings: number;
}
