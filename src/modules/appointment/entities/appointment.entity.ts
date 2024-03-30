import { registerEnumType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mentor } from '../../mentor/entities/mentor.entity';
import { User } from '../../user/entities/user.entity';
import { AppointmentStatus } from '../enums/appointment.enum';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mentor, (mentor) => mentor.appointments)
  @JoinColumn({ name: 'mentor_id' })
  mentor: Mentor;
  @Column()
  mentor_id: string;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.AWAITING_PAYMENT,
  })
  status: AppointmentStatus;

  @Column({ default: 0 })
  reschedule_count: number;

  @Column({ name: 'payment_id'})
  paymentId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
  description: 'Appointment Statuses',
});
