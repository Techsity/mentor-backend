import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MentorService } from './mentor.service';
import { Mentor } from './entities/mentor.entity';
import { CreateMentorInput } from './dto/create-mentor.input';
import { UpdateMentorInput } from './dto/update-mentor.input';

@Resolver(() => Mentor)
export class MentorResolver {
  constructor(private readonly mentorService: MentorService) {}

  @Mutation(() => Mentor)
  createMentorProfile(
    @Args('createMentorInput') createMentorInput: CreateMentorInput,
  ) {
    return this.mentorService.createMentorProfile(createMentorInput);
  }
}
