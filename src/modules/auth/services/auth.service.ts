import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailerService } from '../../../common/mailer/mailer.service';
import { CreateRegisterInput } from '../dto/register-auth.input';
import { User } from '../../user/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { CustomResponseMessage, CustomStatusCodes } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';
import { checkPassword, generateOTP, hashPassword } from 'src/lib/utils';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(REQUEST) private readonly request: any,
    private eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private jwtService: JwtService,
    private mailService: MailerService,
  ) {}

  async login(loginPayload: any) {
    const { email, password } = loginPayload;
    const user = await this.validateUser(email, password);
    if (!user) throw new Error('Invalid credentials');
    if (!user.is_active) throw new Error('Your account is not active.');
    if (!user.is_verified) throw new Error('Kindly verify your email.');
    const payload = { email: email, sub: user.id, user: user };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: `secretKey`,
      }),
      user,
      is_mentor: user.mentor ? true : false,
    };
  }
  async register(registerPayload: CreateRegisterInput) {
    try {
      const hashedPassword = await hashPassword(registerPayload.password);
      registerPayload.password = hashedPassword;
      const user = new User();
      user.id = '54160d2c-24d1-4dc7-8373-3dcf8610c418';
      // !
      // const user = await this.userRepository.save(registerPayload);
      // !

      // Create OTP
      await this.createUpdateOtp(user.id);
      return { message: 'Check your email for otp!', user };
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
      if (error?.code === '23505') {
        throw new CustomResponseMessage(CustomStatusCodes.REG_DUPLICATE_USER);
      }
      throw new InternalServerErrorException('An Error Occured');
    }
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['mentor'],
    });

    if (!user) return null;

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) return null;

    return user;
  }

  async verifyUser(otp: string) {
    const user: any = await this.otpVerification(otp);

    const { id, is_verified, is_active } = user;

    if (is_verified && is_active)
      throw new CustomResponseMessage(CustomStatusCodes.OTP_ALREADY_VERIFIED);
    await this.userRepository.update(
      { id },
      {
        is_active: true,
        is_verified: true,
      },
    );
    await this.authRepository.delete({ user: { id: user.id } }); // Delete OTP from DB
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
    const userOtp: any = await this.otpVerification(otp);
    const { id } = userOtp;

    const hashedPassword = await hashPassword(password);
    await this.userRepository.update(
      { id },
      {
        password: hashedPassword,
      },
    );
    await this.authRepository.delete({ id: userOtp.id }); // Delete OTP from DB
    return { message: 'User Password Reset Successful.' };
  }
  async createUpdateOtp(userId: string) {
    const otp = generateOTP(userId);
    const OTP_EXPIRY_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
    try {
      // Find existing OTP for the user
      const existingOtp = await this.authRepository.findOne({
        where: { user: { id: userId } },
      });
      if (existingOtp) {
        // Update the existing OTP
        existingOtp.token = otp;
        existingOtp.expiry = new Date(Date.now() + OTP_EXPIRY_DURATION_MS);
        await this.authRepository.save(existingOtp);
      } else {
        // Create a new OTP entry
        // !
        // await this.authRepository.save({
        //   token: otp.toString(),
        //   user: { id: userId },
        //   expiry: new Date(Date.now() + OTP_EXPIRY_DURATION_MS),
        // });
        // !
        // const getUser = await this.userRepository.findOne({
        //   where: { id: userId },
        // });
        // if (!getUser) throw new HttpException('User not found', 404);
        // !

        await this.mailService.sendOtpEmail(
          'getUser.email',
          'getUser.name',
          otp.toString(),
        );
      }
      return { message: 'Otp sent', otp };
    } catch (error) {
      const stackTrace = new Error().stack;
      this.logger.error(error, stackTrace);
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
    const response: any = await this.authRepository.findOne({
      where: { token: otp },
      relations: ['user'],
    });
    // Verify OTP
    if (!response)
      throw new CustomResponseMessage(CustomStatusCodes.INVALID_OTP);
    const { user } = response;
    return user;
  }
  async findLoggedInUser() {
    const authUser = this.request.req.user.user;
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    return user;
  }
}
