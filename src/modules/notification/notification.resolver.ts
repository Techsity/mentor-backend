import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
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

  // // This is temporary
  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => NotificationDto)
  // async createNotification(@Args('input') input: CreateNotificationInput) {
  // try {
  //   return await this.notificationService.create(input);
  // } catch (error) {
  //   const stack = new Error().stack;
  //   this.logger.error(error, stack);
  //   throw new InternalServerErrorException('Something went wrong');
  // }
  // }

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
  @Query(() => [NotificationDto])
  // Todo: filter args (take, skip)
  viewAllNotifications(@CurrentUser() user: User) {
    return this.notificationService.findAll(user.id);
  }
}
