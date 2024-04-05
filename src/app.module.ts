import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AwsModule } from './aws/aws.module';
import { Appointment } from './modules/appointment/entities/appointment.entity';
import { CourseCategory } from './modules/course/entities/category.entity';
import { CourseType } from './modules/course/entities/course-type.entity';
import { Mentor } from './modules/mentor/entities/mentor.entity';
import { Review } from './modules/review/entities/review.entity';
import { Subscription } from './modules/subscription/entities/subscription.entity';
import { User } from './modules/user/entities/user.entity';
import { Auth } from './modules/auth/entities/auth.entity';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/course/course.module';
import { MentorModule } from './modules/mentor/mentor.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { Course } from './modules/course/entities/course.entity';
import { MediaModule } from './modules/media/media.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { ReviewModule } from './modules/review/review.module';
import { MailerModule } from './common/mailer/mailer.module';
import { ArticleModule } from './modules/blog/article/article.module';
import { ArticleCategoryModule } from './modules/blog/article-category/article-category.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CartModule } from './modules/cart/cart.module';
import { WalletModule } from './modules/wallet/wallet.module';
import DBConfig from './config/db.config';
import AppConfig from './config/app.config';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './modules/notification/notification.module';
import { Notification } from './modules/notification/entities/notification.entity';
import { EventEmitterListeners } from './lib/event-listeners';
import { ReportedMentor } from './modules/user/entities/reported-mentor.entity';
import { Workshop } from './modules/workshop/entities/workshop.entity';
import { Payment } from './modules/payment/entities/payment.entity';
import { CardModule } from './modules/card/card.module';
import Wallet from './modules/wallet/entities/wallet.entity';
import { Card } from './modules/card/entities/card.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { Transaction } from './modules/payment/entities/transaction.entity';
import { AppointmentRefundRequest } from './modules/appointment/entities/appointment-refund-request.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DBConfig, AppConfig],
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      // redis: {
      //   host: process.env.REDIS_HOST,
      //   port: parseInt(process.env.REDIS_PORT, 10),
      // },
    }),
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: 'secretKey', // Use something more secure in production
      signOptions: {
        // expiresIn: 3600, //1h
        expiresIn: '1d',
      },
      global: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10) || 5432,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Auth,
          User,
          Mentor,
          Course,
          CourseCategory,
          CourseType,
          Subscription,
          Review,
          Appointment,
          AppointmentRefundRequest,
          Notification,
          ReportedMentor,
          Workshop,
          Payment,
          Transaction,
          Wallet,
          Card,
        ],
        synchronize: true,
        logging: !true,
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res, payload, connection }) =>
        connection
          ? { req: connection.context, res, payload }
          : { req, res, payload, connection },
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError: GraphQLFormattedError = {
          message: error?.message,
        };
        return graphQLFormattedError;
      },
    }),
    AwsModule,
    AuthModule,
    UserModule,
    CourseModule,
    MentorModule,
    WorkshopModule,
    SubscriptionModule,
    MediaModule,
    PaymentModule,
    AppointmentModule,
    ReviewModule,
    AppointmentModule,
    MailerModule,
    ArticleModule,
    ArticleCategoryModule,
    WishlistModule,
    CartModule,
    WalletModule,
    EventEmitterModule.forRoot(),
    RabbitMQModule,
    NotificationModule,
    CardModule,
  ],
  providers: [EventEmitterListeners],
  controllers: [AppController],
})
export class AppModule {}
