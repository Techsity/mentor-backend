import { Field, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
} from 'class-validator';
import { UserDTO } from '../../user/dto/user.dto';
import { ReviewType } from '../enums/review.enum';

@ObjectType()
export class ReviewDto {
  @IsNotEmpty()
  @IsEnum(ReviewType)
  @Field()
  type: ReviewType;

  @IsNotEmpty()
  @IsString()
  @Field()
  content: string;

  @IsOptional()
  @Field()
  reviewed_by?: string;

  @IsOptional()
  @IsInt()
  @Field()
  ratings: number;
}
