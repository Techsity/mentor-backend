import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Wallet from './entities/wallet.entity';
import { Payment } from '../payment/entities/payment.entity';
import { REQUEST } from '@nestjs/core';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    @Inject(REQUEST)
    private readonly request: { req: { user: User } },
    @InjectRepository(Wallet) private readonly walletRepository,
    @InjectRepository(Payment) private readonly transactionRepository,
  ) {}
  async creditWallet() {}
  async debitWallet() {}
  async withdrawFunds() {}
  async getAllTransactions(userId: string) {
    // Get all transactions where channel = PAYMENT_CHANNELS.WALLET
  }
}
