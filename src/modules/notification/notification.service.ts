import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    user: User,
    input: CreateNotificationInput,
  ): Promise<NotificationDto> {
    const notification = await this.notificationRepository.save({
      ...input,
      user,
    });
    return notification;
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
    await this.notificationRepository.update(notification.id, notification);
    return true;
  }

  async findAll(userId: string) {
    if (!isUUID(userId)) throw new BadRequestException('Invalid userId');
    return await this.notificationRepository.find({ where: { userId } });
  }
}
