import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CurrentUser } from '../../../lib/custom-decorators';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { UserDTO } from '../dto/user.dto';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { UpdateUserInput } from '../dto/update-user.input';
import { ReportMentorInput } from '../dto/report-mentor.input';
import { ReportedMentorDTO } from '../dto/reported-mentor.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query((returns) => UserDTO)
  async userProfile(): Promise<any> {
    return this.userService.userProfile();
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => UserDTO)
  async updateUserProfile(
    @Args('userUpdateInput') userUpdateInput: UpdateUserInput,
  ): Promise<any> {
    return this.userService.updateProfile(userUpdateInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((returns) => Boolean)
  async toggleFollowMentor(
    @Args('mentorId') mentorId: string,
    @Args('follow') follow: boolean,
  ): Promise<boolean> {
    const result = await this.userService.toggleFollowMentor(mentorId, follow);
    return !!result;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReportedMentorDTO)
  async reportMentor(@Args('input') input: ReportMentorInput) {
    return await this.userService.reportMentor(input);
  }
}
