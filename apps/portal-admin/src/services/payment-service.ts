import { apiClient } from "@/lib/instance";

export interface QRCodeResponse {
  qrUrl: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
}

export interface PaymentSessionInfo {
  qrUrl: string;
  amount: number;
  description: string;
  referenceCode: string;
}

export interface CreateSessionResponse {
  referenceCode: string;
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

  static async getPaymentSession(
    referenceCode: string
  ): Promise<PaymentSessionInfo> {
    const response = await apiClient.get<PaymentSessionInfo>(
      `/sepay/session/${referenceCode}`
    );
    return response.data;
  }

  static async createPaymentSession(
    amount: number,
    userId: string
  ): Promise<CreateSessionResponse> {
    const response = await apiClient.post<CreateSessionResponse>(
      "/sepay/create-session",
      { amount, userId }
    );
    return response.data;
  }
}
