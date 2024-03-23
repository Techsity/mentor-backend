import { Field, Float, ID } from '@nestjs/graphql';
import { Mentor } from 'src/modules/mentor/entities/mentor.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('wallets')
export default class Wallet extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column('float', { default: 0 })
  balance: number;

  @OneToOne(() => Mentor, (mentor) => mentor.wallet, { onDelete: 'RESTRICT' })
  mentor: Mentor;
  @JoinColumn()
  mentor_id: string;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
