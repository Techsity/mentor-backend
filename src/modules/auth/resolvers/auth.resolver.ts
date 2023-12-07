import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CurrentUser } from '../../../lib/custom-decorators';
import { CreateLoginInput } from '../dto/login-auth.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { Auth } from '../entities/auth.entity';
import { CreateRegisterInput } from '../dto/register-auth.input';
import { User } from '../../user/entities/user.entity';
import {
  BasicMessageResponse,
  LoginResponse,
  RegisterResponse,
} from '../types/auth.type';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterResponse)
  registerUser(
    @Args('createRegisterInput') createRegisterInput: CreateRegisterInput,
  ): Promise<RegisterResponse> {
    try {
      return this.authService.register(createRegisterInput);
    } catch (error) {
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
