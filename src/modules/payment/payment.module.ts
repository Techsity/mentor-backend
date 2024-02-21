import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  providers: [PaymentResolver, PaymentService],
})
export class PaymentModule {}
