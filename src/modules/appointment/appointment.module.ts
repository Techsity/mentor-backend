import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorModule } from '../mentor/mentor.module';
import { UserModule } from '../user/user.module';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './services/appointment.service';
import { AppointmentResolver } from './resolvers/appointment.resolver';
import { AuthModule } from '../auth/auth.module';
import { AppointmentStatus } from './enums/appointment.enum';
import { registerEnumType } from '@nestjs/graphql';
import { AppointmentCronService } from './services/appointment-cron.service';
import { BullModule } from '@nestjs/bull';
import { AppointmentQueueService } from './services/appointment-queue.service';
import { QUEUES } from 'src/common/queues.constants';
import { AppointmentQueueProcessor } from './services/appointment-queue.processor';
import { NotificationModule } from '../notification/notification.module';
import { AppointmentRefundRequest } from './entities/appointment-refund-request.entity';

registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
  description: 'The status of an appointment',
});
@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.APPOINTMENTS,
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => MentorModule),
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Appointment, AppointmentRefundRequest]),
    NotificationModule,
  ],
  providers: [
    AppointmentResolver,
    AppointmentService,
    AppointmentCronService,
    AppointmentQueueService,
    AppointmentQueueProcessor,
  ],
  exports: [
    TypeOrmModule.forFeature([Appointment, AppointmentRefundRequest]),
    AppointmentCronService,
    AppointmentQueueService,
    AppointmentQueueProcessor,
  ],
})
export class AppointmentModule {}
