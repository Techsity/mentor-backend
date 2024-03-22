import { registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PAYMENT_CHANNELS, PaymentStatus } from '../enum';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reference: string;

  @Column({ type: 'float' })
  amount: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @Column()
  currency: string;

  @Column()
  access_code: string;

  @Column({ type: 'character varying', nullable: true })
  channel: keyof typeof PAYMENT_CHANNELS | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'jsonb' })
  metadata: PaymentMetaData;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

type PaymentMetaData = { resourceId: string; resourceType: string };
