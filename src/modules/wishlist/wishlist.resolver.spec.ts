import { Test, TestingModule } from '@nestjs/testing';
import { WishlistResolver } from './wishlist.resolver';
import { WishlistService } from './wishlist.service';

describe('WishlistResolver', () => {
  let resolver: WishlistResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WishlistResolver, WishlistService],
    }).compile();

    resolver = module.get<WishlistResolver>(WishlistResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
