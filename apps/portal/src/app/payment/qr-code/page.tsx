"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentService, PaymentSessionInfo } from "@/services/payment-service";

export default function QRCodePage() {
  const searchParams = useSearchParams();
  const referenceCode = searchParams.get("ref");
  const [session, setSession] = useState<PaymentSessionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (referenceCode) {
      setLoading(true);
      PaymentService.getPaymentSession(referenceCode)
        .then((info) => {
          setSession(info);
          setError(null);
        })
        .catch(() => {
          setError("Không tìm thấy giao dịch hoặc đã hết hạn.");
        })
        .finally(() => setLoading(false));
    }
  }, [referenceCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-2">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-primary-blue)]">
        Quét mã QR để thanh toán
      </h1>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}
      {session && (
        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-lg">
          <img
            src={session.qrUrl}
            alt="QR Code"
            className="w-64 h-64 object-contain border-2 border-[var(--color-primary-blue)] rounded-lg"
          />
          <div className="text-lg font-semibold text-gray-700">
            Số tiền:{" "}
            <span className="text-[var(--color-primary-blue)]">
              {session.amount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            Nội dung: {session.description}
          </div>
          <div className="text-xs text-gray-400">
            Mã giao dịch: {session.referenceCode}
          </div>
        </div>
      )}
    </div>
  );
}
