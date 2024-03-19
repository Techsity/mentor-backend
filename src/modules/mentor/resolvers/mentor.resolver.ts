import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { MentorService } from '../services/mentor.service';
import { Mentor } from '../entities/mentor.entity';
import { CreateMentorInput } from '../dto/create-mentor.input';
import { UpdateMentorInput } from '../dto/update-mentor.input';
import { MentorDTO } from '../dto/mentor.dto';
import { CurrentUser } from 'src/lib/custom-decorators';

@Resolver(() => Mentor)
export class MentorResolver {
  constructor(private readonly mentorService: MentorService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MentorDTO)
  createMentorProfile(
    @Args('createMentorInput') createMentorInput: CreateMentorInput,
  ): Promise<any> {
    return this.mentorService.createMentorProfile(createMentorInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MentorDTO)
  updateMentorProfile(
    @Args('updateMentorInput') updateMentorInput: UpdateMentorInput,
  ): Promise<any> {
    return this.mentorService.updateMentorProfile(updateMentorInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => MentorDTO)
  getMentorProfile(): Promise<any> {
    return this.mentorService.getMentorProfile();
  }

  @Query(() => MentorDTO)
  viewMentor(@Args('id') id: string): Promise<any> {
    return this.mentorService.viewMentor(id);
  }

  @Query(() => [MentorDTO])
  viewAllMentors(): Promise<any> {
    return this.mentorService.viewAllMentors();
  }
}
