import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentDTO } from '../dto/appointment.dto';
import { CreateAppointmentInput } from '../dto/create-appointment.input';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment.enum';

@UseGuards(GqlAuthGuard)
@Resolver()
export class AppointmentResolver {
  constructor(private readonly appointmentService: AppointmentService) {}
  @Mutation(() => AppointmentDTO)
  createAppointment(
    @Args('createAppointmentInput')
    createAppointmentInput: CreateAppointmentInput,
    @Args('mentor') mentor: string,
  ): Promise<any> {
    return this.appointmentService.createAppointment(
      createAppointmentInput,
      mentor,
    );
  }
  @Mutation(() => AppointmentDTO)
  toggleAppointmentStatus(
    @Args('mentorId')
    mentorId: string,
    @Args('appointmentId')
    appointmentId: string,
    @Args('status') status: AppointmentStatus,
  ): Promise<any> {
    return this.appointmentService.toggleAppointmentStatus(
      mentorId,
      appointmentId,
      status,
    );
  }
  // }
  @Query(() => AppointmentDTO)
  viewAppointment(
    @Args('appointmentId')
    appointmentId: string,
  ): Promise<any> {
    return this.appointmentService.viewAppointment(appointmentId);
  }
  @Query(() => [AppointmentDTO])
  viewAppointments(
    @Args('statuses', { type: () => [String] })
    statuses: string[],
  ): Promise<any> {
    return this.appointmentService.viewAppointments(statuses);
  }
}
