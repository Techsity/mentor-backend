import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Wallet from './entities/wallet.entity';
import { Payment } from '../payment/entities/payment.entity';
import { REQUEST } from '@nestjs/core';
import { User } from '../user/entities/user.entity';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';
import { Mentor } from '../mentor/entities/mentor.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly notificationService: NotificationService, // Todo: @InjectRepository(Payment) private readonly transactionRepository:Repository<Payment>,
  ) {}

  private async findMentorProfile(mentorId: string) {
    const mentorProfile = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ['user', 'wallet'],
    });
    if (!mentorProfile) throw new NotFoundException('Mentor profile not found');
    return mentorProfile;
  }

  async createWallet(mentorId: string) {
    const mentor = await this.findMentorProfile(mentorId);
    let wallet = await this.walletRepository.findOne({
      where: { mentor_id: mentor.id },
    });
    if (!wallet) {
      wallet = await this.walletRepository.save({ mentor });
      this.logger.log(`A new wallet was created for mentor (${mentor.id})`);
    }
    return wallet;
  }

  async findWallet(mentorId: string) {
    const mentorProfile = await this.findMentorProfile(mentorId);
    let wallet = mentorProfile.wallet;
    if (!wallet) wallet = await this.createWallet(mentorProfile.id);
    return wallet;
  }

  async topupLedgerBalance(mentorId: string, amount: number) {
    const mentor = await this.findMentorProfile(mentorId);
    const wallet = await this.findWallet(mentorId);

    const amountDecimal = new Decimal(amount);
    const walletBalance = new Decimal(wallet.ledger_balance);
    wallet.ledger_balance = Number(
      walletBalance.plus(amountDecimal).toFixed(2),
    );

    try {
      await this.walletRepository.save(wallet);
      this.notificationService.create(mentor.user, {
        body: `Your ledger balance has been credited with ${amount.toFixed(2)}`,
        title: 'Credit Alert',
      });
      this.logger.log(`Mentor (${mentor.id})'s wallet got credited | Ledger balance`);
    } catch (error) {
      this.logger.error(
        `Failed to credit wallet for mentor (${mentor.id}): ${error.message}`,
      );
      throw error;
    }
  }

  async creditWallet(mentorId: string, amount: number) {
    const mentor = await this.findMentorProfile(mentorId);
    const wallet = await this.findWallet(mentorId);

    const amountDecimal = new Decimal(amount);
    const walletBalance = new Decimal(wallet.available_balance);
    wallet.available_balance = Number(
      walletBalance.plus(amountDecimal).toFixed(2),
    );

    try {
      await this.walletRepository.save(wallet);
      this.notificationService.create(mentor.user, {
        body: `Your wallet has been credited with ${amount.toFixed(2)}`,
        title: 'Credit Alert',
      });
      this.logger.log(`Mentor (${mentor.id})'s wallet got credited | Main balance`);
    } catch (error) {
      this.logger.error(
        `Failed to credit wallet for mentor (${mentor.id}): ${error.message}`,
      );
      throw error;
    }
  }

  async debitWallet() {}
  async getWalletBalance() {}
  async withdrawFunds() {}
  async getAllTransactions(userId: string) {
    // Get all transactions where channel = PAYMENT_CHANNELS.WALLET
  }
}
