import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import NotificationDto from './dto/notification.dto';
import {
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/lib/custom-decorators';
import { User } from '../user/entities/user.entity';

@Resolver()
export class NotificationResolver {
  private logger = new Logger(NotificationService.name);

  constructor(private readonly notificationService: NotificationService) {}

  // * This is temporary
  @UseGuards(GqlAuthGuard)
  @Mutation(() => NotificationDto)
  async createNotification(
    @CurrentUser() user: User,
    @Args('input') input: CreateNotificationInput,
  ) {
    try {
      return await this.notificationService.create(user, input);
    } catch (error) {
      const stack = new Error().stack;
      this.logger.error(error, stack);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [NotificationDto])
  // Todo: filter args (take, skip)
  viewAllNotifications(@CurrentUser() user: User) {
    return this.notificationService.findAll(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  markAllNotificationsAsRead(@CurrentUser() user: User) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async readNotification(
    @Args('notificationId') notificationId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.notificationService.read(user.id, notificationId);
    } catch (error) {
      const stack = new Error(error).stack;
      this.logger.error(error, stack);
      throw new InternalServerErrorException({
        message: 'Something went wrong',
        error: error.message,
      });
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteNotification(
    @Args('notificationId') notificationId: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.notificationService.delete(user.id, notificationId);
    } catch (error) {
      const stack = new Error(error).stack;
      this.logger.error(error, stack);
      throw new InternalServerErrorException({
        message: 'Something went wrong',
        error: error.message,
      });
    }
  }
}
