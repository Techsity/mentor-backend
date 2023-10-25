import { Test, TestingModule } from '@nestjs/testing';
import { MentorResolver } from './mentor.resolver';
import { MentorService } from './mentor.service';

describe('MentorResolver', () => {
  let resolver: MentorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorResolver, MentorService],
    }).compile();

    resolver = module.get<MentorResolver>(MentorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
