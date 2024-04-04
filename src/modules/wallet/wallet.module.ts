import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payment/entities/payment.entity';
import Wallet from './entities/wallet.entity';
import { Mentor } from '../mentor/entities/mentor.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Wallet, Mentor]),
    NotificationModule,
  ],
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule.forFeature([Wallet])],
})
export class WalletModule {}
