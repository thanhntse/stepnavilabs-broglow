import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SePayController } from './sepay.controller';
import { SePayService } from './sepay.service';
import { Payment, PaymentSchema } from './schema/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [SePayController],
  providers: [SePayService],
  exports: [SePayService],
})
export class SePayModule {}
