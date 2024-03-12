import { forwardRef, Module } from '@nestjs/common';
import { SesService } from '../../aws/ses.service';
import { MailerModule } from '../../common/mailer/mailer.module';
import { MailerService } from '../../common/mailer/mailer.service';
import { UserModule } from '../user/user.module';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { User } from '../user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule),
    forwardRef(() => MailerModule),
    TypeOrmModule.forFeature([User, Auth]),
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    MailerService,
    SesService,
  ],
  exports: [AuthService, PassportModule, JwtStrategy],
})
export class AuthModule {}
