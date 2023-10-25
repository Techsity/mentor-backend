import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopResolver } from './workshop.resolver';

@Module({
  providers: [WorkshopResolver, WorkshopService]
})
export class WorkshopModule {}
