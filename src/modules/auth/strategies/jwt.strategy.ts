import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/modules/auth/services/auth.service';
// import { transformUserResponse } from '../../common/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `secretKey`,
    });
  }
  async validate(validatePayload: {
    email: string;
    sub: string;
  }): Promise<any> {
    const user = await this.authService.findById(validatePayload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
