import { Module } from '@nestjs/common';
import { WorkshopService } from './services/workshop.service';
import { WorkshopResolver } from './services/workshop.resolver';

@Module({
  providers: [WorkshopResolver, WorkshopService],
})
export class WorkshopModule {}
