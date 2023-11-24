import { Resolver } from '@nestjs/graphql';
import { WishlistService } from './wishlist.service';

@Resolver()
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}
}
