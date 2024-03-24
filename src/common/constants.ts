import { HttpException, HttpStatus } from '@nestjs/common';

export enum CustomStatusCodes {
  NEUTRAL = 0,
  REG_ERROR = 10010,
  REG_SUCCESS = 10020,
  REG_DUPLICATE_USER = 23505,
  DUPLICATE_RESOURCE = 23505,
  AUTH_INVALID_EMAIL = 12003,
  AUTH_INVALID_PIN = 12005,
  USER_NOT_FOUND = 12904,
  OTP_SENT = 15002,
  OTP_VERIFIED = 13402,
  OTP_ALREADY_VERIFIED = 13404,
  OTP_EXPIRED = 14004,
  INVALID_OTP = 10254,
  OTP_SERVICE_ERROR = 32012,
  USER_IS_NOT_ACTIVE = 12040,
  USER_IS_ACTIVE = 12041,
  INVALID_TOKEN = 80169,
  WALLET_EXISTS = 43820,
  WALLET_NOT_FOUND = 39022,
  WALLET_INSUFFICIENT_FUNDS = 40400,
  INVALID_TRANSACTION_PIN = 40000,
  TRANSACTION_NOT_SUCCESSFUL = 50300,
  TRANSACTION_SUCCESSFUL = 20000,
  ABANDONED_PAYMENT = 23212,
}
Object.assign(HttpStatus, CustomStatusCodes);
export class CustomResponseMessage extends HttpException {
  statusCode: CustomStatusCodes | HttpStatus;
  constructor(statusCode: CustomStatusCodes | HttpStatus) {
    const message = `statusCode: ${statusCode} - ${CustomResponseMessage.getErrorMessage(
      statusCode,
    )}`;
    super({ message, statusCode }, statusCode);
    this.statusCode = statusCode;
  }

  static getErrorMessage(statusCode: CustomStatusCodes | HttpStatus): string {
    switch (statusCode) {
      case CustomStatusCodes.OTP_SERVICE_ERROR:
        return 'Error sending token to device - An Internal Server Error.';
      case CustomStatusCodes.INVALID_OTP:
        return 'Invalid OTP provided - Please confirm your credentials and check your number for the otp sent to you, or request for a new OTP.';
      case CustomStatusCodes.OTP_VERIFIED:
        return 'OTP verified!';
      case CustomStatusCodes.OTP_ALREADY_VERIFIED:
        return 'Your account has already been verified.';
      case CustomStatusCodes.OTP_SENT:
        return 'An OTP has been sent to this phone number.';
      case CustomStatusCodes.USER_NOT_FOUND:
        return 'User does not exist';
      case CustomStatusCodes.REG_DUPLICATE_USER:
        return 'User with this email or phone number already exists';
      case CustomStatusCodes.AUTH_INVALID_EMAIL:
        return 'Invalid Auth credentials';
      case CustomStatusCodes.AUTH_INVALID_PIN:
        return 'Invalid Password';
      case CustomStatusCodes.WALLET_EXISTS:
        return 'User has an exisiting wallet already.';
      case CustomStatusCodes.WALLET_NOT_FOUND:
        return 'Wallet not found.';
      case CustomStatusCodes.WALLET_INSUFFICIENT_FUNDS:
        return 'Insufficient funds in wallet';
      case CustomStatusCodes.INVALID_TRANSACTION_PIN:
        return 'Invalid transaction pin';
      case CustomStatusCodes.ABANDONED_PAYMENT:
        return 'Payment was abandoned. Re-initialize payment with the access_code';
      case CustomStatusCodes.TRANSACTION_NOT_SUCCESSFUL:
        return 'Transaction not successful';
      case CustomStatusCodes.TRANSACTION_SUCCESSFUL:
        return 'Transaction was successful';
      default:
        return 'Unknown response code';
    }
  }
}

export const imageUploadValidation = {
  ALLOWED_MIME_IMG_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  EXTENSIONS: ['.jpg', '.png', '.jpeg'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
};
export const videoUploadValidation = {
  ALLOWED_MIME_VID_TYPES: ['video/mp4', 'video/mpeg', 'video/webm'],
  EXTENSIONS: ['.mp4', '.mpeg', '.webm'],
  MAX_FILE_SIZE: 200 * 1024 * 1024, // 200 MB
};

export const daysOfTheWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
