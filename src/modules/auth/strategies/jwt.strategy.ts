import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `secretKey`,
    });
  }
  async validate(payload: any, done: VerifiedCallback) {
    const { email } = payload;
    const user = await this.authService.findLoggedInUser(email);
    if (!user) return done(new UnauthorizedException('Unauthorized'), false);
    if (!user.is_verified)
      return done(new BadRequestException('Kindly verify your email.'), false);
    if (!user.is_active)
      return done(
        new UnauthorizedException('Your account is deactivated'),
        false,
      );
    return done(null, user, payload.iat);
  }
}
