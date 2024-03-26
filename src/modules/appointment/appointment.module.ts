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
import { AppointmentSchedulerService } from './services/appointment-scheduler.service';
import { BullModule } from '@nestjs/bull';
import { AppointmentQueueService } from './services/appointment-queue.service';

registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
  description: 'The status of an appointment',
});
@Module({
  imports: [
    BullModule.registerQueue({ name: 'appointments' }),
    forwardRef(() => AuthModule),
    forwardRef(() => MentorModule),
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Appointment]),
  ],
  providers: [
    AppointmentResolver,
    AppointmentService,
    AppointmentSchedulerService,
    AppointmentQueueService,
  ],
  exports: [
    TypeOrmModule.forFeature([Appointment]),
    AppointmentSchedulerService,
    AppointmentQueueService,
  ],
})
export class AppointmentModule {}
