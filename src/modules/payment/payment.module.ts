import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './services/payment.service';
import { PaymentResolver } from './payment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Course } from '../course/entities/course.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { SubscriptionModule } from '../subscription/subscription.module';
import { Subscription } from '../subscription/entities/subscription.entity';
import PaystackProvider from 'src/providers/paystack/paystack.provider';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([
      Payment,
      Workshop,
      Course,
      Subscription,
      Transaction,
    ]),
    SubscriptionModule,
  ],
  providers: [PaymentResolver, PaymentService, PaystackProvider],
  exports: [TypeOrmModule.forFeature([Payment, Transaction]), PaymentService],
})
export class PaymentModule {}
