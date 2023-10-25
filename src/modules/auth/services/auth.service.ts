import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRegisterInput } from '../dto/register-auth.input';
import { User } from '../../user/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { CustomResponseMessage, CustomStatusCodes } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';
import { checkPassword, generateOTP, hashPassword } from 'src/lib/utils';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async login(loginPayload: any) {
    const { email, password } = loginPayload;
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (!user.isActive) {
      throw new Error('Your account is not active.');
    }
    if (!user.isVerified) {
      throw new Error('Kindly verify your email.');
    }
    const payload = { email: email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: `secretKey`,
      }),
      user,
    };
  }
  async register(registerPayload: CreateRegisterInput) {
    try {
      const hashedPassword = await hashPassword(registerPayload.password);
      registerPayload.password = hashedPassword;
      const user = await this.userRepository.save(registerPayload);
      // Create OTP
      await this.createUpdateOtp(user.id);
      //Todo:  Send Email
      return { message: 'Check your email for otp!', user };
    } catch (error) {
      if (error?.code === '23505') {
        throw new CustomResponseMessage(CustomStatusCodes.REG_DUPLICATE_USER);
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Error creating user',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) return null;

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new CustomResponseMessage(CustomStatusCodes.AUTH_INVALID_PIN);
    }

    return user;
  }

  async verifyUser(otp: string) {
    const user: any = await this.otpVerification(otp);

    const { id, is_verified, is_active } = user.userId;

    if (is_verified && is_active)
      throw new CustomResponseMessage(CustomStatusCodes.OTP_ALREADY_VERIFIED);
    await this.userRepository.update(
      { id },
      {
        is_active: true,
        is_verified: true,
      },
    );
    await this.authRepository.delete({ id: user.id }); // Delete OTP from DB
    return { message: 'User verified successfully' };
  }
  async forgetPassword(email: string) {
    const user: any = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new CustomResponseMessage(CustomStatusCodes.USER_NOT_FOUND);
    // Create OTP
    await this.createUpdateOtp(user.id);
    //Todo:  Send Email
    return {
      message: 'To reset password, please check your email for otp!',
    };
  }
  async resetPassword(resetData: any) {
    const { otp, password } = resetData;
    const user: any = await this.otpVerification(otp);

    const { id } = user.userId;

    const hashedPassword = await hashPassword(password);
    await this.userRepository.update(
      { id },
      {
        password: hashedPassword,
      },
    );
    await this.authRepository.delete({ id: user.id }); // Delete OTP from DB
    return { message: 'User Password Reset Successful.' };
  }

  async createUpdateOtp(userId: any) {
    const otp = generateOTP(userId);
    const OTP_EXPIRY_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
    let data;
    try {
      // Check if there's an existing otp
      const checkUserOtp = await this.authRepository.findOne({
        where: { userId },
      });
      if (checkUserOtp) {
        // update existing otp
        data = await this.authRepository.update(
          { userId },
          {
            token: otp.toString(),
            expiry: new Date(Date.now() + OTP_EXPIRY_DURATION_MS),
          },
        );
      } else {
        data = await this.authRepository.save({
          token: otp.toString(),
          userId,
          expiry: new Date(Date.now() + OTP_EXPIRY_DURATION_MS),
        });
      }
      return data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Unable to generate otp',
            cause: error.message || error,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async otpVerification(otp: string) {
    const user: any = await this.authRepository.findOne({
      where: { token: otp },
      relations: ['userId'],
    });
    // Verify OTP
    if (!user) throw new CustomResponseMessage(CustomStatusCodes.INVALID_OTP);
    return user;
  }
}
