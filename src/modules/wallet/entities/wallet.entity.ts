import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
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

@ObjectType()
@Entity('wallets')
export default class Wallet extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column('float', { default: 0 })
  balance: number;

  @OneToOne(() => Mentor, (mentor) => mentor.wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: Mentor;

  @Column() 
  mentor_id: string;

  //* add more fields...

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // @Field(() => String)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
