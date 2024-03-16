import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { WorkshopService } from '../services/workshop.service';
import WorkshopDto from '../dto/workshop.dto';
import { CreateWorkshopInput } from '../dto/create-workshop.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/guards/gql-auth.guard';
import MentorRoleGuard from 'src/modules/auth/guards/mentor-role.guard';

@Resolver()
export class WorkshopResolver {
  constructor(private readonly workshopService: WorkshopService) {}
  @UseGuards(GqlAuthGuard, MentorRoleGuard)
  @Mutation(() => WorkshopDto)
  async createWorkshop(@Args('input') input: CreateWorkshopInput) {
    return await this.workshopService.createWorkshop(input);
  }
}
