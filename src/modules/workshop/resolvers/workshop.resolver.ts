import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { WorkshopService } from '../services/workshop.service';
import WorkshopDto from '../dto/workshop.dto';
import { CreateWorkshopInput } from '../dto/create-workshop.input';

@Resolver()
export class WorkshopResolver {
  constructor(private readonly workshopService: WorkshopService) {}
  @Mutation(() => WorkshopDto)
  async createWorkshop(@Args('input') input: CreateWorkshopInput) {
    return await this.workshopService.createWorkshop(input);
  }
}
