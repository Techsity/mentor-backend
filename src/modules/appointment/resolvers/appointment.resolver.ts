import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentDTO } from '../dto/appointment.dto';
import { CreateAppointmentInput } from '../dto/create-appointment.input';
import { AppointmentStatus } from '../enums/appointment.enum';
import MentorRoleGuard from 'src/modules/auth/guards/mentor-role.guard';

@UseGuards(GqlAuthGuard)
@Resolver()
export class AppointmentResolver {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Mutation(() => AppointmentDTO)
  async createAppointment(
    @Args('createAppointmentInput')
    createAppointmentInput: CreateAppointmentInput,
    @Args('mentor') mentor: string,
  ): Promise<any> {
    return await this.appointmentService.createAppointment(
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

  @Query(() => AppointmentDTO)
  viewAppointment(
    @Args('appointmentId')
    appointmentId: string,
  ): Promise<any> {
    return this.appointmentService.viewAppointment(appointmentId);
  }

  @Query(() => [AppointmentDTO])
  viewAllAppointments(
    @Args('statuses', { type: () => [AppointmentStatus] })
    statuses: AppointmentStatus[],
  ): Promise<any> {
    return this.appointmentService.viewAllAppointments(statuses);
  }

  @UseGuards(GqlAuthGuard, MentorRoleGuard)
  @Mutation(() => AppointmentDTO)
  async acceptAppointment(@Args('id') id: string) {
    return await this.appointmentService.acceptAppointment(id);
  }
}
