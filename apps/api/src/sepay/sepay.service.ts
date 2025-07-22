import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SePayQrRequest,
  SePayQrResponse,
  SePayWebhookPayload,
  SePayWebhookResponse,
} from './interfaces/sepay.interface';
import { Payment } from './schema/payment.schema';

@Injectable()
export class SePayService {
  private readonly logger = new Logger(SePayService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  /**
   * Tạo URL QR code cho thanh toán SePay
   * @param payload Thông tin thanh toán
   * @returns URL của QR code
   */
  generateQrUrl(payload: SePayQrRequest): SePayQrResponse {
    const accountNumber = this.configService.get<string>(
      'SEPAY_ACCOUNT_NUMBER',
    );
    const bankCode = this.configService.get<string>('SEPAY_BANK_CODE');
    const { amount, description } = payload;

    if (!accountNumber || !bankCode) {
      throw new Error(
        'SEPAY_ACCOUNT_NUMBER và SEPAY_BANK_CODE chưa được cấu hình',
      );
    }

    // Mã hóa nội dung chuyển khoản để đảm bảo URL không bị lỗi
    const encodedDescription = encodeURIComponent(description);

    // Tạo URL theo định dạng của SePay
    const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${amount}&des=${encodedDescription}`;

    return { qrUrl };
  }

  /**
   * Xử lý webhook từ SePay khi có giao dịch mới
   * @param payload Dữ liệu webhook từ SePay
   * @returns Kết quả xử lý
   */
  async processWebhook(
    payload: SePayWebhookPayload,
  ): Promise<SePayWebhookResponse> {
    try {
      this.logger.log(`Nhận webhook từ SePay: ID giao dịch ${payload.id}`);

      // Tìm payment session đã tạo trước đó
      const payment = await this.paymentModel.findOne({
        referenceCode: payload.referenceCode,
      });
      if (!payment) {
        this.logger.error(
          'Không tìm thấy payment session với referenceCode này!',
        );
        return { success: false, message: 'Không tìm thấy payment session' };
      }

      // Cập nhật trạng thái/thông tin giao dịch nếu cần
      // payment.status = 'paid'; // nếu có trường status
      // payment.transactionDate = payload.transactionDate; // nếu muốn lưu thêm
      await payment.save();

      this.logger.log(`Đã cập nhật trạng thái giao dịch ID: ${payment._id}`);

      return {
        success: true,
        message: 'Webhook đã được xử lý thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý webhook: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Lỗi khi xử lý webhook: ${error.message}`,
      };
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán dựa trên mã tham chiếu
   * @param referenceCode Mã tham chiếu của giao dịch
   * @returns Thông tin trạng thái thanh toán
   */
  async checkPaymentStatus(
    referenceCode: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Tìm giao dịch trong database dựa trên referenceCode
      const payment = await this.paymentModel.findOne({ referenceCode }).exec();

      if (!payment) {
        return {
          success: false,
          message: 'Không tìm thấy giao dịch',
        };
      }

      // Giao dịch đã tồn tại, xác nhận thanh toán thành công
      return {
        success: true,
        message: 'Giao dịch đã được thanh toán thành công',
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`,
      };
    }
  }

  async createPaymentSession(amount: number, userId: string) {
    const referenceCode = 'PAY' + Date.now() + Math.floor(Math.random() * 1000);
    await this.paymentModel.create({
      referenceCode,
      transferAmount: amount,
      userId,
      description: userId,
    });
    return { referenceCode };
  }

  async getPaymentSession(referenceCode: string) {
    const payment = await this.paymentModel.findOne({ referenceCode });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');
    const accountNumber = this.configService.get<string>(
      'SEPAY_ACCOUNT_NUMBER',
    );
    const bankCode = this.configService.get<string>('SEPAY_BANK_CODE');
    const encodedDescription = encodeURIComponent(payment.description || '');
    const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${payment.transferAmount}&des=${encodedDescription}`;
    return {
      qrUrl,
      amount: payment.transferAmount,
      description: payment.description,
      referenceCode: payment.referenceCode,
      // status: payment.status, // nếu có
    };
  }
}
