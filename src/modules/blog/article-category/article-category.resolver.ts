import { Resolver } from '@nestjs/graphql';
import { ArticleCategoryService } from './article-category.service';

@Resolver()
export class ArticleCategoryResolver {
  constructor(private readonly articleCategoryService: ArticleCategoryService) {}
}
