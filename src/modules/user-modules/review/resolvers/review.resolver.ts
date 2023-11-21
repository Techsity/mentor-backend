import { Resolver } from '@nestjs/graphql';
import { ReviewService } from '../services/review.service';

@Resolver()
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}
}
