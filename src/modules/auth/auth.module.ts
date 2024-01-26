import { forwardRef, Global, Module } from '@nestjs/common';
import { SesService } from '../../aws/ses.service';
import { MailerModule } from '../../common/mailer/mailer.module';
import { MailerService } from '../../common/mailer/mailer.service';
import { UserModule } from '../user/user.module';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { User } from '../user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secretKey', // Use something more secure in production
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => MailerModule),
    TypeOrmModule.forFeature([User, Auth]),
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    GqlAuthGuard,
    MailerService,
    SesService,
  ],
  exports: [GqlAuthGuard, AuthService],
})
export class AuthModule {}
