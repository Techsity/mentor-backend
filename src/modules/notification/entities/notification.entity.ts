import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column('uuid')
  userId: string;

  @Column({ enum: NotificationResourceType, type: 'enum' })
  resourceType: NotificationResourceType;

  @Column('uuid')
  resourceId: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

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
