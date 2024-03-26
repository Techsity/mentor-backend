export const PAYMENT_CHANNELS = {
  CARD: 'card',
  BANK: 'bank',
  USSD: 'ussd',
  QR_CODE: 'qr',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
};

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ABANDONED = 'abandoned',
}
