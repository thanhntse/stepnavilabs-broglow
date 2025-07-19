import { Injectable, Logger } from '@nestjs/common';
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

      // Ghi log thông tin giao dịch
      this.logger.debug('Thông tin giao dịch:', JSON.stringify(payload));

      // Lưu thông tin giao dịch vào database
      const paymentData = {
        gateway: payload.gateway,
        transactionDate: payload.transactionDate,
        accountNumber: payload.accountNumber,
        code: payload.code,
        content: payload.content,
        transferType: payload.transferType,
        transferAmount: payload.transferAmount,
        accumulated: payload.accumulated,
        subAccount: payload.subAccount,
        referenceCode: payload.referenceCode,
        description: payload.description,
      };

      // Tạo bản ghi thanh toán mới
      const payment = new this.paymentModel(paymentData);
      await payment.save();

      this.logger.log(`Đã lưu thông tin giao dịch ID: ${payment._id}`);

      // TODO: Xử lý dữ liệu giao dịch theo logic nghiệp vụ
      // Ví dụ:
      // 1. Kiểm tra giao dịch đã tồn tại chưa
      // 2. Cập nhật trạng thái đơn hàng
      // 3. Gửi thông báo cho người dùng

      // Đoạn này sẽ thực hiện logic xử lý khi nhận webhook
      // Ví dụ kiểm tra mã đơn hàng trong nội dung chuyển khoản và cập nhật trạng thái

      if (payload.transferType === 'in') {
        // Xử lý giao dịch tiền vào
        this.logger.log(
          `Giao dịch tiền vào: ${payload.transferAmount} VND từ ${payload.gateway}`,
        );

        // TODO: Cập nhật trạng thái thanh toán trong hệ thống
      } else {
        // Xử lý giao dịch tiền ra (nếu cần)
        this.logger.log(
          `Giao dịch tiền ra: ${payload.transferAmount} VND đến ${payload.gateway}`,
        );
      }

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
  async checkPaymentStatus(referenceCode: string): Promise<{ success: boolean; message: string }> {
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
      this.logger.error(`Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`,
      };
    }
  }
}
