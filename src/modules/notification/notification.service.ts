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

  /**
   * @param user - The user recieving the notification
   * @param input - The notification body
   */

  async create(
    user: User,
    input: CreateNotificationInput,
  ): Promise<NotificationDto> {
    const notification = await this.notificationRepository.save({
      ...input,
      user,
    });
    // if (user.is_active) {
    // Todo: add to create email service queue
    // Send email notification
    // }
    this.notificationGateway.dispatchNotification({
      userId: user.id,
      payload: notification,
    });
    this.logger.log(
      `Notification created for user ${user.id}`,
      `Notification event fired`,
    );
    return notification;
  }

  async findAll(userId: string) {
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    return await Notification.find({ where: { userId } });
  }

  async read(userId: string, notificationId: string): Promise<boolean> {
    if (!isUUID(notificationId))
      throw new BadRequestException('Invalid notificationId');
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    const updateResult = await Notification.update(
      { userId, id: notificationId, read: false },
      { read: true },
    );
    if (updateResult.affected === 0)
      throw new NotFoundException('Notification not found');

    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    await Notification.update({ userId, read: false }, { read: true });
    return true;
  }

  async delete(userId: string, notificationId: string): Promise<boolean> {
    if (!isUUID(notificationId))
      throw new BadRequestException('Invalid notificationId');
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    const notification = await Notification.delete({
      id: notificationId,
      userId,
    });
    if (!notification.affected)
      throw new NotFoundException('Notification not found');

    return true;
  }
}
