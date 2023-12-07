import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopResolver } from './workshop.resolver';
import { WorkshopService } from '../services/workshop.service';

describe('WorkshopResolver', () => {
  let resolver: WorkshopResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopResolver, WorkshopService],
    }).compile();

    resolver = module.get<WorkshopResolver>(WorkshopResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
