import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentLog } from './payment-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentLog])],
  exports: [TypeOrmModule],
})
export class PaymentsModule {}