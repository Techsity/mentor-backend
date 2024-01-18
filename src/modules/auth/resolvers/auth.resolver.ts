import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CreateLoginInput } from '../dto/login-auth.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { AuthService } from '../services/auth.service';
import { Auth } from '../entities/auth.entity';
import { CreateRegisterInput } from '../dto/register-auth.input';
import {
  BasicMessageResponse,
  LoginResponse,
  RegisterResponse,
} from '../types/auth.type';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  private logger = new Logger(AuthResolver.name);

  @Mutation(() => RegisterResponse)
  registerUser(
    @Args('createRegisterInput') createRegisterInput: CreateRegisterInput,
  ): Promise<RegisterResponse> {
    try {
      return this.authService.register(createRegisterInput);
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error,
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  @Mutation(() => LoginResponse)
  loginUser(
    @Args('createLoginInput') createLoginInput: CreateLoginInput,
  ): Promise<LoginResponse> {
    try {
      return this.authService.login(createLoginInput);
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Error Occured!',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Mutation(() => BasicMessageResponse)
  verifyUser(@Args('otp') otp: string): Promise<BasicMessageResponse> {
    try {
      return this.authService.verifyUser(otp);
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Error Occurred!',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Mutation(() => BasicMessageResponse)
  requestOtp(@Args('userId') userId: string): Promise<any> {
    try {
      return this.authService.createUpdateOtp(userId);
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Error Occurred!',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Mutation(() => BasicMessageResponse)
  forgetPassword(@Args('email') email: string): Promise<BasicMessageResponse> {
    try {
      return this.authService.forgetPassword(email);
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Error Occurred!',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Mutation(() => BasicMessageResponse)
  resetPassword(
    @Args('resetData') resetData: ResetPasswordInput,
  ): Promise<BasicMessageResponse> {
    try {
      return this.authService.resetPassword(resetData);
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Error Occurred!',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // @UseGuards(GqlAuthGuard)
  // @Query((returns) => User)
  // me(@CurrentUser() user: User): any {
  //   return user;
  // }
}
