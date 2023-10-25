import { Resolver } from '@nestjs/graphql';
import { WorkshopService } from './workshop.service';

@Resolver()
export class WorkshopResolver {
  constructor(private readonly workshopService: WorkshopService) {}
}
