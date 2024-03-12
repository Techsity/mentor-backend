import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { Notification } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEventsGateway } from './gateways/notification-events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationResolver,
    NotificationService,
    NotificationEventsGateway,
  ],
  exports: [
    TypeOrmModule.forFeature([Notification]),
    NotificationService,
    NotificationEventsGateway,
  ],
})
export class NotificationModule {}
