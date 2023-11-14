import { forwardRef, Global, Module } from '@nestjs/common';
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
    TypeOrmModule.forFeature([User, Auth]),
  ],
  providers: [AuthResolver, AuthService, JwtStrategy, GqlAuthGuard],
  exports: [GqlAuthGuard, AuthService],
})
export class AuthModule {}
