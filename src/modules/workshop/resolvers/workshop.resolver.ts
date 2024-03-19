import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WorkshopService } from '../services/workshop.service';
import WorkshopDto from '../dto/workshop.dto';
import { CreateWorkshopInput } from '../dto/create-workshop.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/guards/gql-auth.guard';
import MentorRoleGuard from 'src/modules/auth/guards/mentor-role.guard';
import { CourseTypeEnum } from 'src/modules/course/enums/course.enums';

@Resolver()
export class WorkshopResolver {
  constructor(private readonly workshopService: WorkshopService) {}

  @UseGuards(GqlAuthGuard, MentorRoleGuard)
  @Mutation(() => WorkshopDto)
  async createWorkshop(@Args('input') input: CreateWorkshopInput) {
    return await this.workshopService.createWorkshop(input);
  }

  @Query(() => [WorkshopDto])
  async viewAllWorkshops(
    @Args('skip') skip: number,
    @Args('take') take: number,
    @Args({ name: 'type', type: () => CourseTypeEnum, nullable: true })
    type?: CourseTypeEnum,
    @Args('category', { nullable: true }) category?: string,
  ) {
    return await this.workshopService.viewAllWorkshops({
      skip,
      take,
      category,
      type,
    });
  }

  @Query(() => WorkshopDto)
  async viewWorkshop(@Args('workshopId') workshopId: string) {
    return await this.workshopService.findWorkshopById(workshopId);
  }
}
