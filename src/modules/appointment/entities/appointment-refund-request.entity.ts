import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { RefundStatus } from 'src/modules/payment/enum';

@Entity()
export class AppointmentRefundRequest extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('varchar')
  reason: string;

  @OneToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
  @Column('uuid')
  appointment_id: string;

  @Column({ name: 'payment_reference' })
  paymentReference: string;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}
