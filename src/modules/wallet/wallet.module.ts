import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payment/entities/payment.entity';
import Wallet from './entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Wallet])],
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule.forFeature([Wallet])],
})
export class WalletModule {}
