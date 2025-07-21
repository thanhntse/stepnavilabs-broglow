import { apiClient } from "@/lib/instance";

export interface QRCodeResponse {
  qrUrl: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
}

export class PaymentService {
  /**
   * Tạo QR code cho thanh toán
   * @param amount Số tiền thanh toán
   * @param userId ID người dùng
   * @returns Promise với URL của QR code
   */
  static async generateQRCode(
    amount: number,
    userId: string
  ): Promise<QRCodeResponse> {
    try {
      const response = await apiClient.post<QRCodeResponse>(
        "/sepay/generate-qr",
        {
          amount,
          userId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo QR code:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   * @param referenceCode Mã tham chiếu thanh toán
   * @returns Promise với kết quả thanh toán
   */
  static async checkPaymentStatus(
    referenceCode: string
  ): Promise<PaymentResult> {
    try {
      const response = await apiClient.get<PaymentResult>(
        `/sepay/check-payment/${referenceCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
      throw error;
    }
  }
}
