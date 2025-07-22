"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentService, PaymentSessionInfo } from "@/services/payment-service";
import { Button } from "primereact/button";

export default function QRCodePage() {
  const searchParams = useSearchParams();
  const referenceCode = searchParams.get("ref");
  const [session, setSession] = useState<PaymentSessionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "success" | "error" | null>(
    null
  );
  const [statusMsg, setStatusMsg] = useState<string>("");

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

  const handleCheckStatus = async () => {
    if (!referenceCode) return;
    setStatus(null);
    setStatusMsg("");
    setLoading(true);
    try {
      const result = await PaymentService.checkPaymentStatus(referenceCode);
      if (result.success) {
        setStatus("success");
        setStatusMsg("Thanh toán thành công!");
      } else {
        setStatus("pending");
        setStatusMsg("Đang chờ xử lý hoặc chưa nhận được thanh toán.");
      }
    } catch {
      setStatus("error");
      setStatusMsg("Có lỗi khi kiểm tra trạng thái giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-primary-pastel)] to-white py-10 px-2">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 hover-lift transition-all">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-primary-blue)] mb-2 text-center">
            Quét mã QR để thanh toán
          </h1>
          {loading && (
            <div className="text-base text-gray-500">Đang tải...</div>
          )}
          {error && (
            <div className="text-red-500 font-semibold mb-4">{error}</div>
          )}
          {session && (
            <>
              <img
                src={session.qrUrl}
                alt="QR Code"
                className="w-60 h-60 object-contain border-2 border-[var(--color-primary-blue)] rounded-2xl shadow"
              />
              <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between text-base font-semibold text-gray-700">
                  <span>Số tiền:</span>
                  <span className="text-[var(--color-primary-blue)]">
                    {session.amount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Nội dung:</span>
                  <span className="text-right">{session.description}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Mã giao dịch:</span>
                  <span className="text-right">{session.referenceCode}</span>
                </div>
              </div>
              <Button
                label="Kiểm tra kết quả"
                onClick={handleCheckStatus}
                className="w-full mt-2 bg-gradient-to-r from-[var(--color-primary-blue)] to-[var(--color-primary-lightblue)] border-0 hover:from-blue-600 hover:to-blue-400 text-white font-semibold py-2 rounded-full text-base transition-all shadow magnetic-btn"
                loading={loading}
              />
              {status && (
                <div
                  className={
                    "w-full text-center mt-2 " +
                    (status === "success"
                      ? "text-green-600 font-bold"
                      : status === "pending"
                        ? "text-yellow-600 font-semibold"
                        : "text-red-600 font-semibold")
                  }
                >
                  {statusMsg}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
