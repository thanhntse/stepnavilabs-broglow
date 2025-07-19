import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: String })
  gateway: string;

  @Prop({ type: String })
  transactionDate: string;

  @Prop({ type: String })
  accountNumber: string;

  @Prop({ type: String, default: null })
  code: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String, enum: ['in', 'out'] })
  transferType: string;

  @Prop({ type: Number })
  transferAmount: number;

  @Prop({ type: Number })
  accumulated: number;

  @Prop({ type: String, default: null })
  subAccount: string;

  @Prop({ type: String })
  referenceCode: string;

  @Prop({ type: String, default: '' })
  description: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
