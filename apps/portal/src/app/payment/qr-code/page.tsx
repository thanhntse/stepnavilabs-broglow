"use client";

import { PaymentService } from "@/services/payment-service";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useState } from "react";

export default function QRCodePage() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get("amount");
  const userId = searchParams.get("userId");
  const referenceCode = searchParams.get("reference") || "";

  useEffect(() => {
    const generateQR = async () => {
      if (!amount || !userId) {
        setError("Thiếu thông tin thanh toán");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await PaymentService.generateQRCode(
          Number(amount),
          userId
        );
        setQrUrl(response.qrUrl);
      } catch (error) {
        console.error("Lỗi khi tạo mã QR:", error);
        setError("Không thể tạo mã QR thanh toán");
      } finally {
        setLoading(false);
      }
    };

    generateQR();

    // Thiết lập kiểm tra trạng thái thanh toán mỗi 5 giây
    const interval = setInterval(async () => {
      if (referenceCode) {
        try {
          const result = await PaymentService.checkPaymentStatus(referenceCode);
          if (result.success) {
            // Nếu thanh toán thành công, chuyển hướng đến trang kết quả
            router.push(
              `/payment/result?status=success&reference=${referenceCode}`
            );
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [amount, userId, referenceCode, router]);

  const handleCancel = () => {
    router.back();
  };

  const header = (
    <div className="text-center p-4">
      <h2 className="text-xl font-bold mb-2">Thanh toán</h2>
      <p className="text-sm text-gray-600">Quét mã QR dưới đây để thanh toán</p>
    </div>
  );

  const footer = (
    <div className="flex justify-center p-3">
      <Button label="Hủy bỏ" outlined onClick={handleCancel} />
    </div>
  );

  return (
    <div className="container py-8 max-w-md mx-auto">
      <Card header={header} footer={footer} className="w-full">
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
              <span className="ml-2">Đang tạo mã QR...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <>
              <div className="relative h-64 w-64 mb-4">
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="QR Code Thanh toán"
                    style={{ objectFit: "contain" }}
                  />
                )}
              </div>
              <div className="text-center mb-4">
                <p className="font-medium">
                  Số tiền:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(amount || 0))}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
