import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
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
