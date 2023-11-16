import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { Appointment } from './modules/user-modules/appointment/entities/appointment.entity';
import { CourseCategory } from './modules/user-modules/course/entities/category.entity';
import { CourseType } from './modules/user-modules/course/entities/course-type.entity';
import { Mentor } from './modules/user-modules/mentor/entities/mentor.entity';
import { Review } from './modules/user-modules/review/entities/review.entity';
import { Subscription } from './modules/user-modules/subscription/entities/subscription.entity';
import { User } from './modules/user-modules/user/entities/user.entity';
import { Auth } from './modules/user-modules/auth/entities/auth.entity';
import { UserModule } from './modules/user-modules/user/user.module';
import { AuthModule } from './modules/user-modules/auth/auth.module';
import { CourseModule } from './modules/user-modules/course/course.module';
import { MentorModule } from './modules/user-modules/mentor/mentor.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { WorkshopModule } from './modules/user-modules/workshop/workshop.module';
import { SubscriptionModule } from './modules/user-modules/subscription/subscription.module';
import { Course } from './modules/user-modules/course/entities/course.entity';
import { MediaModule } from './modules/user-modules/media/media.module';
import { PaymentModule } from './modules/user-modules/payment/payment.module';
import { AdminModule } from './modules/admin-modules/admin/admin.module';
import { AdminCourseModule } from './modules/admin-modules/course/course.module';
import { AdminUserModule } from './modules/admin-modules/user/user.module';
import { RoleModule } from './modules/admin-modules/role/role.module';
import { AppointmentModule } from './modules/user-modules/appointment/appointment.module';
import { ReviewModule } from './modules/user-modules/review/review.module';
import { MailerModule } from './common/mailer/mailer.module';
import DBConfig from './config/db.config';
import AppConfig from './config/app.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      load: [DBConfig, AppConfig],
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
        ],
        synchronize: true,
        logging: true,
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
    AuthModule,
    UserModule,
    CourseModule,
    MentorModule,
    WorkshopModule,
    SubscriptionModule,
    MediaModule,
    PaymentModule,
    AdminModule,
    RoleModule,
    AppointmentModule,
    ReviewModule,
    AppointmentModule,
    MailerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
