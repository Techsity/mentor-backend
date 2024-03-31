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
  OneToOne,
} from 'typeorm';
import { PAYMENT_CHANNELS, PaymentStatus } from '../enum';
import { User } from 'src/modules/user/entities/user.entity';
import { SubscriptionType } from 'src/modules/subscription/enums/subscription.enum';
import { ISOCurrency } from '../types/payment.type';
import { Transaction } from './transaction.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: ISOCurrency })
  currency: ISOCurrency;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  exchange_rate: number;

  @Column({ type: 'enum', enum: ISOCurrency, default: ISOCurrency.NGN })
  base_currency: ISOCurrency;

  @Column()
  access_code: string;

  @Column({
    type: 'enum',
    enum: PAYMENT_CHANNELS,
    default: PAYMENT_CHANNELS.CARD,
  })
  channel: PAYMENT_CHANNELS;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'jsonb' })
  metadata: PaymentMetaData;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

type PaymentMetaData = { resourceId: string; resourceType: SubscriptionType };
