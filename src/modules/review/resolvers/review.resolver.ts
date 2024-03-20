import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CreateReviewArgs } from '../dto/review.args';
import { ReviewDto } from '../dto/review.dto';
import { ReviewService } from '../services/review.service';

@UseGuards(GqlAuthGuard)
@Resolver()
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Mutation(() => ReviewDto)
  createReview(@Args("args") args: CreateReviewArgs): Promise<any> {
    console.log({ args });
    return this.reviewService.createReview(args);
  }
}
