import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '../../../common/mailer/mailer.module';
import { MailerService } from '../../../common/mailer/mailer.service';
import { MentorModule } from '../mentor/mentor.module';
import { UserModule } from '../user/user.module';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentResolver } from './appointment.resolver';
import { AuthModule } from '../auth/auth.module';
import { AppointmentStatus } from './enums/appointment.enum';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
  description: 'The status of an appointment',
});
@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => MentorModule),
    forwardRef(() => UserModule),
    MailerModule,
    TypeOrmModule.forFeature([Appointment]),
  ],
  providers: [AppointmentResolver, AppointmentService, MailerService],
  exports: [TypeOrmModule.forFeature([Appointment])],
})
export class AppointmentModule {}
