import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { User } from './modules/user/entities/user.entity';
import { Auth } from './modules/auth/entities/auth.entity';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/course/course.module';
import { MentorModule } from './modules/mentor/mentor.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'mentor_user',
      password: 'mentor_password',
      database: 'mentor_db',
      entities: [User, Auth],
      synchronize: true,
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
    UserModule,
    AuthModule,
    CourseModule,
    MentorModule,
    WorkshopModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
