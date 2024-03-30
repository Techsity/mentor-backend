export enum PAYMENT_CHANNELS {
  CARD = 'card',
  BANK = 'bank',
  USSD = 'ussd',
  QR_CODE = 'qr',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  WALLET = 'wallet',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ABANDONED = 'abandoned',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'successful',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}
