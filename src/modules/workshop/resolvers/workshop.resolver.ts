import { Resolver } from '@nestjs/graphql';
import { WorkshopService } from '../services/workshop.service';

@Resolver()
export class WorkshopResolver {
  constructor(private readonly workshopService: WorkshopService) {}
}
