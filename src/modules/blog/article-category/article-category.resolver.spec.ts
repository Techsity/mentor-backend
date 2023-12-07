import { Test, TestingModule } from '@nestjs/testing';
import { ArticleCategoryResolver } from './article-category.resolver';
import { ArticleCategoryService } from './article-category.service';

describe('ArticleCategoryResolver', () => {
  let resolver: ArticleCategoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleCategoryResolver, ArticleCategoryService],
    }).compile();

    resolver = module.get<ArticleCategoryResolver>(ArticleCategoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
