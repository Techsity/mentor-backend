import {
  Field,
  ObjectType,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
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

@ObjectType()
@Entity('payments')
export class Payment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  reference: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  resourceId: string;

  @Field(() => SubscriptionType)
  @Column({
    type: 'enum',
    enum: SubscriptionType,
    enumName: 'payment_resource_type',
  })
  resourceType: SubscriptionType;

  @Field(() => ISOCurrency)
  @Column({ type: 'enum', enum: ISOCurrency, default: ISOCurrency.NGN })
  currency: ISOCurrency;

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  // exchange_rate: number;

  // @Column({ type: 'enum', enum: ISOCurrency, default: ISOCurrency.NGN })
  // base_currency: ISOCurrency;

  @Field()
  @Column()
  accountNumber: string;

  @Field()
  @Column()
  accountName: string;

  @Field()
  @Column()
  bankCode: string;

  @Column('int', { default: 0 })
  attempts: number;

  @Field(() => PAYMENT_CHANNELS)
  @Column({
    type: 'enum',
    enum: PAYMENT_CHANNELS,
    default: PAYMENT_CHANNELS.CARD,
  })
  channel: PAYMENT_CHANNELS;

  @Field(() => PaymentStatus)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: PaymentMetaData;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

type PaymentMetaData = { resourceId: string; resourceType: SubscriptionType };

registerEnumType(PAYMENT_CHANNELS, { name: 'Payment_channels' });
registerEnumType(PaymentStatus, { name: 'Payment_status' });
