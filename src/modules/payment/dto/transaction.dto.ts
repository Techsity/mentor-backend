import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { TransactionStatus } from '../enum';
  import { User } from 'src/modules/user/entities/user.entity';
  import Wallet from 'src/modules/wallet/entities/wallet.entity';
  
  @Entity({ name: 'transactions' })
  export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Wallet)
    @JoinColumn({ name: 'wallet_id' })
    wallet: Wallet;
  
    @Column({ type: 'enum', enum: ['credit', 'debit'] })
    type: 'credit' | 'debit';
  
    @Column({ name: 'from_bank', type: 'varchar' })
    fromBank: string;
  
    @Column({ name: 'to_bank', type: 'varchar' })
    toBank: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
  
    @Column({ name: 'balance_before', type: 'decimal', precision: 10, scale: 2 })
    balanceBefore: number;
  
    @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2 })
    balanceAfter: number;
  
    @Column({ type: 'varchar' })
    reference: string;
  
    @Column({ type: 'jsonb', nullable: true })
    metadata?: object;
  
    @Column({
      type: 'enum',
      enum: TransactionStatus,
      default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @Column({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
  }
  