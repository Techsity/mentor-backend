import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import NotificationDto from './dto/notification.dto';
import { isUUID } from 'class-validator';
import { User } from '../user/entities/user.entity';
import { NotificationEventsGateway } from './gateways/notification-events.gateway';

@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private notificationGateway: NotificationEventsGateway,
  ) {}

  async create(
    // the user recieving the notification
    user: User,
    input: CreateNotificationInput,
  ): Promise<NotificationDto> {
    const notification = await this.notificationRepository.save({
      ...input,
      user,
    });
    this.notificationGateway.dispatchNotification(notification);
    // if (user.is_active) {
    // Send email notification
    // }
    return notification;
  }

  async findAll(userId: string) {
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    return await this.notificationRepository.find({ where: { userId } });
  }

  async read(userId: string, notificationId: string): Promise<boolean> {
    if (!isUUID(notificationId))
      throw new BadRequestException('Invalid notificationId');
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    const notification = await this.notificationRepository.findOneBy({
      id: notificationId,
      userId,
    });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.read = true;
    await this.notificationRepository.save(notification);
    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    const notifications = await this.notificationRepository.find({
      where: { userId },
    });
    if (notifications.some((n) => !n.read)) {
      for (const notification of notifications) notification.read = true;
      await this.notificationRepository.save(notifications);
    }
    return true;
  }

  async delete(userId: string, notificationId: string): Promise<boolean> {
    if (!isUUID(notificationId))
      throw new BadRequestException('Invalid notificationId');
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    const notification = await this.notificationRepository.findOneBy({
      id: notificationId,
      userId,
    });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.notificationRepository.delete(notification.id);
    return true;
  }
}
