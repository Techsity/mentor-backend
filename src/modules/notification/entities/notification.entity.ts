import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { NotificationResourceType } from '../enums';
import { registerEnumType } from '@nestjs/graphql';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  body: string;

  @Column({ default: false, type: 'boolean' })
  read: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;
  @JoinColumn()
  userId: string;

  @Column({ enum: NotificationResourceType, type: 'enum', nullable: true })
  resourceType: NotificationResourceType;

  @Column('uuid', { nullable: true })
  resourceId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

registerEnumType(NotificationResourceType, {
  name: 'NotificationResourceType',
  description:
    'The is the notification resource type for creating deeplinks on the client',
});
