import { Module } from '@nestjs/common';
import { ArticleCategoryService } from './article-category.service';
import { ArticleCategoryResolver } from './article-category.resolver';

@Module({
  providers: [ArticleCategoryResolver, ArticleCategoryService]
})
export class ArticleCategoryModule {}
